import { z } from 'zod';
import prisma from '../../lib/prisma';

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

// List roles available to a business (system default roles + business custom roles)
export async function listRolesForBusiness(businessId: string | null) {
  return prisma.role.findMany({
    where: {
      OR: [
        { businessId: null }, // system default roles
        ...(businessId ? [{ businessId }] : []), // tenant custom roles
      ],
    },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });
}

// Create custom role for a business
export async function createCustomRole(businessId: string | null, input: z.infer<typeof createRoleSchema>) {
  return prisma.role.create({
    data: {
      name: input.name,
      description: input.description,
      permissions: input.permissions,
      businessId,
      isSystem: false,
    },
  });
}

// Update role details & permissions
export async function updateRole(roleId: string, businessId: string | null, input: z.infer<typeof updateRoleSchema>) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Role not found' };
  }

  if (role.isSystem && input.name && input.name !== role.name) {
    throw { status: 400, code: 'FORBIDDEN', message: 'System role names cannot be renamed' };
  }

  // Tenant Isolation Check
  if (businessId && role.businessId !== businessId) {
    throw { status: 403, code: 'FORBIDDEN', message: 'Cannot edit roles belonging to another business' };
  }

  return prisma.role.update({
    where: { id: roleId },
    data: input,
  });
}

// Delete custom role
export async function deleteRole(roleId: string, businessId: string | null) {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: { _count: { select: { users: true } } },
  });

  if (!role) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Role not found' };
  }

  if (role.isSystem) {
    throw { status: 400, code: 'FORBIDDEN', message: 'Built-in system roles cannot be deleted' };
  }

  if (businessId && role.businessId !== businessId) {
    throw { status: 403, code: 'FORBIDDEN', message: 'Cannot delete roles belonging to another business' };
  }

  if (role._count.users > 0) {
    throw { status: 400, code: 'ROLE_IN_USE', message: `Cannot delete role assigned to ${role._count.users} user(s)` };
  }

  return prisma.role.delete({ where: { id: roleId } });
}
