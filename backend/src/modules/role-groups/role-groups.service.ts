import { z } from 'zod';
import prisma from '../../lib/prisma';

export const createRoleGroupSchema = z.object({
  name: z.string().min(2, 'Role group name must be at least 2 characters'),
  description: z.string().optional(),
  roleIds: z.array(z.string()).default([]),
});

export const updateRoleGroupSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  roleIds: z.array(z.string()).optional(),
});

// List Role Groups for Tenant Business
export async function listRoleGroups(businessId: string | null) {
  const where: any = businessId
    ? { OR: [{ businessId }, { isSystem: true }] }
    : {};

  const groups = await prisma.roleGroup.findMany({
    where,
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      _count: {
        select: { users: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return groups.map((g) => ({
    id: g.id,
    businessId: g.businessId,
    name: g.name,
    description: g.description,
    isSystem: g.isSystem,
    createdAt: g.createdAt,
    userCount: g._count.users,
    roles: g.roles.map((r) => r.role),
  }));
}

// Get Single Role Group Detail
export async function getRoleGroupById(businessId: string | null, id: string) {
  const group = await prisma.roleGroup.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      users: true,
    },
  });

  if (!group) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Role group not found' };
  }

  // Tenant isolation check
  if (group.businessId && businessId && group.businessId !== businessId) {
    throw { status: 403, code: 'FORBIDDEN', message: 'Access denied to this role group' };
  }

  return {
    ...group,
    roles: group.roles.map((r) => r.role),
  };
}

// Create New Role Group
export async function createRoleGroup(
  businessId: string | null,
  input: z.infer<typeof createRoleGroupSchema>
) {
  return prisma.$transaction(async (tx) => {
    const group = await tx.roleGroup.create({
      data: {
        businessId: businessId || null,
        name: input.name,
        description: input.description,
      },
    });

    if (input.roleIds && input.roleIds.length > 0) {
      await tx.roleGroupMapping.createMany({
        data: input.roleIds.map((roleId) => ({
          roleGroupId: group.id,
          roleId,
        })),
      });
    }

    return getRoleGroupById(businessId, group.id);
  });
}

// Update Role Group
export async function updateRoleGroup(
  businessId: string | null,
  id: string,
  input: z.infer<typeof updateRoleGroupSchema>
) {
  await getRoleGroupById(businessId, id);

  return prisma.$transaction(async (tx) => {
    if (input.name || input.description !== undefined) {
      await tx.roleGroup.update({
        where: { id },
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }

    if (input.roleIds !== undefined) {
      // Clear existing mappings
      await tx.roleGroupMapping.deleteMany({
        where: { roleGroupId: id },
      });

      // Add new mappings
      if (input.roleIds.length > 0) {
        await tx.roleGroupMapping.createMany({
          data: input.roleIds.map((roleId) => ({
            roleGroupId: id,
            roleId,
          })),
        });
      }
    }

    return getRoleGroupById(businessId, id);
  });
}

// Delete Role Group
export async function deleteRoleGroup(businessId: string | null, id: string) {
  const group = await getRoleGroupById(businessId, id);

  if (group.isSystem) {
    throw { status: 400, code: 'SYSTEM_PROTECTED', message: 'System role groups cannot be deleted' };
  }

  await prisma.roleGroup.delete({
    where: { id },
  });

  return { success: true };
}
