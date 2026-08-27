import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import { forBusiness } from '../../lib/tenantClient';

export const orderItemSchema = z.object({
  garmentTypeId: z.string().min(1, 'Garment type is required'),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  fabricNotes: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'At least one garment order item is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

// Auto-generate order number e.g. ORD-2026-0001
async function generateOrderNumber(businessId: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await prisma.order.count({
    where: { businessId },
  });
  const padded = String(count + 1).padStart(4, '0');
  return `ORD-${currentYear}-${padded}`;
}

// List Orders for Business (with search and status filter)
export async function listOrders(businessId: string, search?: string, status?: OrderStatus) {
  const where: any = { businessId };

  if (status) {
    where.status = status;
  }

  if (search && search.trim() !== '') {
    const q = search.trim();
    where.OR = [
      { orderNumber: { contains: q, mode: 'insensitive' } },
      { customer: { name: { contains: q, mode: 'insensitive' } } },
      { customer: { phone: { contains: q, mode: 'insensitive' } } },
    ];
  }

  return prisma.order.findMany({
    where,
    include: {
      customer: true,
      items: {
        include: { garmentType: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get Single Order Detail
export async function getOrderById(businessId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, businessId },
    include: {
      customer: true,
      items: {
        include: { garmentType: true },
      },
    },
  });

  if (!order) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Order not found' };
  }

  return order;
}

// Create New Tailoring Order
export async function createOrder(
  businessId: string,
  createdById: string,
  input: z.infer<typeof createOrderSchema>
) {
  // Ensure customer belongs to business
  const customer = await forBusiness(businessId).customer.findFirst({
    where: { id: input.customerId },
  });

  if (!customer) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Customer not found' };
  }

  // Calculate order total
  let totalAmount = 0;
  const processedItems = input.items.map((item) => {
    const lineTotal = item.quantity * item.unitPrice;
    totalAmount += lineTotal;
    return {
      garmentTypeId: item.garmentTypeId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: lineTotal,
      fabricNotes: item.fabricNotes,
      specialInstructions: item.specialInstructions,
    };
  });

  const orderNumber = await generateOrderNumber(businessId);

  return prisma.order.create({
    data: {
      businessId,
      customerId: input.customerId,
      orderNumber,
      status: OrderStatus.DRAFT,
      totalAmount,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      notes: input.notes,
      createdById,
      items: {
        create: processedItems,
      },
    },
    include: {
      customer: true,
      items: {
        include: { garmentType: true },
      },
    },
  });
}

// Update Order Status along state workflow
export async function updateOrderStatus(businessId: string, orderId: string, status: OrderStatus) {
  const order = await getOrderById(businessId, orderId);

  return prisma.order.update({
    where: { id: order.id },
    data: { status },
    include: {
      customer: true,
      items: {
        include: { garmentType: true },
      },
    },
  });
}
