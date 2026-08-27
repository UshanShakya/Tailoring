import { z } from 'zod';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';
import prisma from '../../lib/prisma';
import { getOrderById } from '../orders/orders.service';
import { logAuditEvent } from '../../lib/auditLogger';

export const recordPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than 0'),
  method: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
  referenceNote: z.string().optional(),
});

// Auto-generate invoice number e.g. INV-2026-0001
async function generateInvoiceNumber(businessId: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { businessId },
  });
  const padded = String(count + 1).padStart(4, '0');
  return `INV-${currentYear}-${padded}`;
}

// List Invoices for Business (with search and status filter)
export async function listInvoices(businessId: string, search?: string, status?: InvoiceStatus) {
  const where: any = { businessId };

  if (status) {
    where.status = status;
  }

  if (search && search.trim() !== '') {
    const q = search.trim();
    where.OR = [
      { invoiceNumber: { contains: q, mode: 'insensitive' } },
      { order: { orderNumber: { contains: q, mode: 'insensitive' } } },
      { customer: { name: { contains: q, mode: 'insensitive' } } },
      { customer: { phone: { contains: q, mode: 'insensitive' } } },
    ];
  }

  return prisma.invoice.findMany({
    where,
    include: {
      customer: true,
      order: {
        include: {
          items: {
            include: { garmentType: true },
          },
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get Single Invoice Detail
export async function getInvoiceById(businessId: string, invoiceId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, businessId },
    include: {
      customer: true,
      order: {
        include: {
          items: {
            include: { garmentType: true },
          },
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!invoice) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Invoice not found' };
  }

  return invoice;
}

// Generate Invoice from Order
export async function generateInvoiceFromOrder(businessId: string, orderId: string, actorEmail: string = 'system') {
  const order = await getOrderById(businessId, orderId);

  // Check if invoice already exists for this order
  const existing = await prisma.invoice.findUnique({
    where: { orderId: order.id },
  });

  if (existing) {
    return existing;
  }

  const invoiceNumber = await generateInvoiceNumber(businessId);
  const total = Number(order.totalAmount);

  const invoice = await prisma.invoice.create({
    data: {
      businessId,
      orderId: order.id,
      customerId: order.customerId,
      invoiceNumber,
      status: InvoiceStatus.UNPAID,
      totalAmount: total,
      paidAmount: 0,
      dueAmount: total,
      dueDate: order.dueDate,
      notes: order.notes,
    },
    include: {
      customer: true,
      order: {
        include: {
          items: {
            include: { garmentType: true },
          },
        },
      },
      payments: true,
    },
  });

  // Log Audit Event
  await logAuditEvent({
    businessId,
    actorEmail,
    action: 'INVOICE_GENERATED',
    entityType: 'Invoice',
    entityId: invoice.id,
    details: {
      invoiceNumber: invoice.invoiceNumber,
      orderNumber: order.orderNumber,
      totalAmount: total,
    },
  });

  return invoice;
}

// Record Payment Against Invoice
export async function recordPayment(
  businessId: string,
  invoiceId: string,
  recordedBy: string,
  input: z.infer<typeof recordPaymentSchema>
) {
  const invoice = await getInvoiceById(businessId, invoiceId);

  const currentDue = Number(invoice.dueAmount);
  if (input.amount > currentDue) {
    throw {
      status: 400,
      code: 'INVALID_PAYMENT',
      message: `Payment amount ($${input.amount}) exceeds remaining due balance ($${currentDue})`,
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Payment record
    const payment = await tx.payment.create({
      data: {
        businessId,
        invoiceId: invoice.id,
        amount: input.amount,
        method: input.method,
        referenceNote: input.referenceNote,
        recordedBy,
      },
    });

    // 2. Recalculate totals
    const newPaidAmount = Number(invoice.paidAmount) + input.amount;
    const newDueAmount = Number(invoice.totalAmount) - newPaidAmount;

    let newStatus: InvoiceStatus = InvoiceStatus.PARTIALLY_PAID;
    if (newDueAmount <= 0.001) {
      newStatus = InvoiceStatus.PAID;
    } else if (newPaidAmount <= 0) {
      newStatus = InvoiceStatus.UNPAID;
    }

    // 3. Update Invoice
    const updatedInvoice = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: newPaidAmount,
        dueAmount: Math.max(0, newDueAmount),
        status: newStatus,
      },
      include: {
        customer: true,
        order: {
          include: {
            items: {
              include: { garmentType: true },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return { payment, invoice: updatedInvoice };
  });

  // Log Audit Event
  await logAuditEvent({
    businessId,
    actorEmail: recordedBy,
    action: 'PAYMENT_RECORDED',
    entityType: 'Payment',
    entityId: result.payment.id,
    details: {
      invoiceNumber: invoice.invoiceNumber,
      paymentAmount: input.amount,
      method: input.method,
      newDueBalance: Number(result.invoice.dueAmount),
      status: result.invoice.status,
    },
  });

  return result;
}
