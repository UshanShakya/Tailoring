import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { JwtPayloadUser } from '../../types/express';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Aggregate effective permissions from primary Role + assigned RoleGroup
function calculateEffectivePermissions(role: any, roleGroup?: any): string[] {
  const permSet = new Set<string>();

  const rolePerms = (role?.permissions as string[]) || [];
  rolePerms.forEach((p) => permSet.add(p));

  if (roleGroup && roleGroup.roles) {
    for (const mapping of roleGroup.roles) {
      const groupRolePerms = (mapping.role?.permissions as string[]) || [];
      groupRolePerms.forEach((p) => permSet.add(p));
    }
  }

  return Array.from(permSet);
}

export async function loginUser(input: z.infer<typeof loginSchema>) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      business: true,
      role: true,
      roleGroup: {
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) {
    throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
  }

  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValidPassword) {
    throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
  }

  const permissions = calculateEffectivePermissions(user.role, user.roleGroup);

  const payload: JwtPayloadUser = {
    userId: user.id,
    email: user.email,
    roleId: user.role.id,
    roleName: user.role.name,
    permissions,
    businessId: user.businessId,
  };

  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN as any });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN as any });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name,
        permissions,
        isSystem: user.role.isSystem,
      },
      roleGroup: user.roleGroup
        ? {
            id: user.roleGroup.id,
            name: user.roleGroup.name,
            description: user.roleGroup.description,
          }
        : null,
      businessId: user.businessId,
      businessName: user.business?.name || null,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshTokens(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as JwtPayloadUser;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        business: true,
        role: true,
        roleGroup: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw { status: 401, code: 'UNAUTHORIZED', message: 'User account is inactive or deleted' };
    }

    const permissions = calculateEffectivePermissions(user.role, user.roleGroup);

    const payload: JwtPayloadUser = {
      userId: user.id,
      email: user.email,
      roleId: user.role.id,
      roleName: user.role.name,
      permissions,
      businessId: user.businessId,
    };

    const newAccessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN as any });
    const newRefreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN as any });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: {
          id: user.role.id,
          name: user.role.name,
          permissions,
          isSystem: user.role.isSystem,
        },
        roleGroup: user.roleGroup
          ? {
              id: user.roleGroup.id,
              name: user.roleGroup.name,
              description: user.roleGroup.description,
            }
          : null,
        businessId: user.businessId,
        businessName: user.business?.name || null,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (err: any) {
    if (err.status) throw err;
    throw { status: 401, code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' };
  }
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      businessId: true,
      isActive: true,
      createdAt: true,
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
          isSystem: true,
        },
      },
      roleGroup: {
        select: {
          id: true,
          name: true,
          description: true,
          roles: {
            select: {
              role: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw { status: 404, code: 'NOT_FOUND', message: 'User profile not found' };
  }

  const permissions = calculateEffectivePermissions(user.role, user.roleGroup);

  return {
    ...user,
    role: {
      id: user.role.id,
      name: user.role.name,
      permissions,
      isSystem: user.role.isSystem,
    },
  };
}
