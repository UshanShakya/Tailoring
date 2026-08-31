import bcrypt from 'bcryptjs';
import { z } from 'zod';
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
  roleId: z.string().min(1, 'Role selection is required'),
  roleGroupId: z.string().optional().nullable(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  roleId: z.string().optional(),
  roleGroupId: z.string().optional().nullable(),
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
      isActive: true,
      createdAt: true,
      businessId: true,
      business: {
        select: {
          id: true,
          name: true,
        },
      },
      role: {
        select: {
          id: true,
          name: true,
          permissions: true,
        },
      },
      roleGroup: {
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

  // Get or verify Business Admin role
  const adminRole = await prisma.role.findFirst({
    where: { name: 'Business Admin' },
  });

  if (!adminRole) {
    throw { status: 500, code: 'SYSTEM_ERROR', message: 'System Business Admin role not found' };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      roleId: adminRole.id,
      businessId: input.businessId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      businessId: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
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
      isActive: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          name: true,
          permissions: true,
        },
      },
      roleGroup: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

// Business Admin: Create staff user in caller's tenant
export async function createStaffUser(businessId: string, input: z.infer<typeof createStaffSchema>) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw { status: 400, code: 'EMAIL_EXISTS', message: 'User with this email already exists' };
  }

  const role = await prisma.role.findUnique({ where: { id: input.roleId } });
  if (!role) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Selected role not found' };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  return forBusiness(businessId).user.create({
    name: input.name,
    email: input.email,
    passwordHash,
    roleId: input.roleId,
    roleGroupId: input.roleGroupId || null,
  });
}

// Business Admin / Super Admin: Update user status/details/roles
export async function updateUser(
  id: string,
  businessId: string | null,
  callerRoleName: string | undefined,
  input: z.infer<typeof updateUserSchema>
) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });

  if (!user) {
    throw { status: 404, code: 'NOT_FOUND', message: 'User not found' };
  }

  const isSuperAdmin = callerRoleName === 'Super Admin';

  if (!isSuperAdmin) {
    // 1. Tenant Isolation Check
    if (businessId && user.businessId !== businessId) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Cannot edit user from another business tenant' };
    }

    // 2. Business Admins cannot modify Business Admin or Super Admin user accounts
    if (user.role?.name === 'Business Admin' || user.role?.name === 'Super Admin') {
      throw { status: 403, code: 'FORBIDDEN', message: 'Business Admins cannot modify Business Admin or Super Admin user accounts' };
    }

    // 3. If updating roleId, verify target role is NOT Business Admin or Super Admin
    if (input.roleId) {
      const targetRole = await prisma.role.findUnique({ where: { id: input.roleId } });
      if (!targetRole) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Selected target role not found' };
      }
      if (targetRole.name === 'Business Admin' || targetRole.name === 'Super Admin') {
        throw { status: 403, code: 'FORBIDDEN', message: 'Business Admins cannot assign Business Admin or Super Admin roles' };
      }
    }
  }

  return prisma.user.update({
    where: { id },
    data: {
      name: input.name,
      roleId: input.roleId,
      roleGroupId: input.roleGroupId !== undefined ? input.roleGroupId : undefined,
      isActive: input.isActive,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      roleGroup: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}
