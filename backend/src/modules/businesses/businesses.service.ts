import { z } from 'zod';
import prisma from '../../lib/prisma';

export const createBusinessSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export const updateBusinessSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function listBusinesses() {
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  return businesses.map((b) => ({
    id: b.id,
    name: b.name,
    address: b.address,
    phone: b.phone,
    isActive: b.isActive,
    createdAt: b.createdAt,
    userCount: b._count.users,
  }));
}

export async function createBusiness(input: z.infer<typeof createBusinessSchema>) {
  return prisma.business.create({
    data: {
      name: input.name,
      address: input.address,
      phone: input.phone,
    },
  });
}

export async function updateBusiness(id: string, input: z.infer<typeof updateBusinessSchema>) {
  const business = await prisma.business.findUnique({ where: { id } });
  if (!business) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Business tenant not found' };
  }

  return prisma.business.update({
    where: { id },
    data: input,
  });
}
