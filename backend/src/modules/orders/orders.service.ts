import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import { forBusiness } from '../../lib/tenantClient';
import { logAuditEvent } from '../../lib/auditLogger';

export const orderItemSchema = z.object({
  garmentTypeId: z.string().min(1, 'Garment type is required'),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().min(0, 'Unit price must be non-negative').optional().nullable(),
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

// List Orders for Business (with search and status filter, supports Super Admin global view)
export async function listOrders(businessId?: string, search?: string, status?: OrderStatus) {
  const where: any = {};
  if (businessId) {
    where.businessId = businessId;
  }

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
      business: true,
      customer: true,
      items: {
        include: { garmentType: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get Single Order Detail
export async function getOrderById(businessId: string | undefined, orderId: string) {
  const where: any = { id: orderId };
  if (businessId) {
    where.businessId = businessId;
  }

  const order = await prisma.order.findFirst({
    where,
    include: {
      business: true,
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

  // Pre-fetch GarmentTypes for auto-filling default prices
  const garmentTypeIds = input.items.map((it) => it.garmentTypeId);
  const garmentTypes = await prisma.garmentType.findMany({
    where: { id: { in: garmentTypeIds } },
  });
  const garmentTypeMap = new Map(garmentTypes.map((g) => [g.id, g]));

  // Calculate order total
  let totalAmount = 0;
  const processedItems = input.items.map((item) => {
    const gType = garmentTypeMap.get(item.garmentTypeId);
    
    // Auto-fill price from garmentType.defaultPrice if unitPrice is missing
    let finalUnitPrice: number | null = null;
    if (item.unitPrice !== undefined && item.unitPrice !== null) {
      finalUnitPrice = item.unitPrice;
    } else if (gType && gType.defaultPrice !== null && gType.defaultPrice !== undefined) {
      finalUnitPrice = Number(gType.defaultPrice);
    }

    const lineTotal = finalUnitPrice !== null ? item.quantity * finalUnitPrice : 0;
    totalAmount += lineTotal;

    return {
      garmentTypeId: item.garmentTypeId,
      quantity: item.quantity,
      unitPrice: finalUnitPrice,
      totalPrice: lineTotal,
      fabricNotes: item.fabricNotes,
      specialInstructions: item.specialInstructions,
    };
  });

  const orderNumber = await generateOrderNumber(businessId);

  const order = await prisma.order.create({
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

  // Log Audit Event
  await logAuditEvent({
    businessId,
    actorEmail: createdById,
    action: 'ORDER_CREATED',
    entityType: 'Order',
    entityId: order.id,
    details: {
      orderNumber: order.orderNumber,
      customerName: customer.name,
      totalAmount: Number(order.totalAmount),
    },
  });

  return order;
}

// Update Order Status along state workflow
export async function updateOrderStatus(
  businessId: string,
  orderId: string,
  status: OrderStatus,
  actorEmail: string = 'system'
) {
  const order = await getOrderById(businessId, orderId);

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status },
    include: {
      customer: true,
      items: {
        include: { garmentType: true },
      },
    },
  });

  // Log Audit Event
  await logAuditEvent({
    businessId,
    actorEmail,
    action: 'ORDER_STATUS_UPDATED',
    entityType: 'Order',
    entityId: updated.id,
    details: {
      orderNumber: updated.orderNumber,
      previousStatus: order.status,
      newStatus: status,
    },
  });

  return updated;
}
