import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Role } from '@prisma/client';
import prisma from '../../lib/prisma';
import { forBusiness } from '../../lib/tenantClient';

export const createBusinessAdminSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([Role.STAFF_FULL, Role.STAFF_BASIC]),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
});

// Super Admin: List all platform users
export async function listAllUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      businessId: true,
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

// Super Admin: Create Business Admin for a tenant
export async function createBusinessAdmin(input: z.infer<typeof createBusinessAdminSchema>) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw { status: 400, code: 'EMAIL_EXISTS', message: 'User with this email already exists' };
  }

  const business = await prisma.business.findUnique({ where: { id: input.businessId } });
  if (!business) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Target business not found' };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: Role.BUSINESS_ADMIN,
      businessId: input.businessId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      businessId: true,
      createdAt: true,
    },
  });
}

// Business Admin / Staff: List users in caller's tenant
export async function listTenantUsers(businessId: string) {
  return forBusiness(businessId).user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

// Business Admin: Create staff user in caller's tenant
export async function createStaffUser(businessId: string, input: z.infer<typeof createStaffSchema>) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw { status: 400, code: 'EMAIL_EXISTS', message: 'User with this email already exists' };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  return forBusiness(businessId).user.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role,
  });
}

// Business Admin / Super Admin: Update user status/details
export async function updateUser(id: string, businessId: string | null, input: z.infer<typeof updateUserSchema>) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw { status: 404, code: 'NOT_FOUND', message: 'User not found' };
  }

  // Tenant Isolation Check: non-Super-Admin users can only edit users within their own business
  if (businessId && user.businessId !== businessId) {
    throw { status: 403, code: 'FORBIDDEN', message: 'Cannot edit user from another business tenant' };
  }

  return prisma.user.update({
    where: { id },
    data: input,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });
}
