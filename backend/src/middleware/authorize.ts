import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

const PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: ['*'],
  BUSINESS_ADMIN: ['*business_scoped*'],
  STAFF_FULL: [
    'customer:*',
    'measurement:*',
    'order:*',
    'invoice:*',
    'payment:*',
    'user:view',
  ],
  STAFF_BASIC: [
    'customer:create',
    'customer:edit',
    'customer:view',
    'measurement:create',
    'measurement:edit',
    'measurement:view',
  ],
};

export function authorize(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      });
    }

    const userRole = req.user.role;
    const allowedPermissions = PERMISSIONS[userRole] || [];

    // Super Admin wildcard
    if (allowedPermissions.includes('*')) {
      return next();
    }

    // Business Admin wildcard for business scoped routes
    if (allowedPermissions.includes('*business_scoped*') && userRole === 'BUSINESS_ADMIN') {
      return next();
    }

    // Direct match or domain wildcard (e.g. 'customer:*')
    const [domain] = requiredPermission.split(':');
    const domainWildcard = `${domain}:*`;

    if (
      allowedPermissions.includes(requiredPermission) ||
      allowedPermissions.includes(domainWildcard)
    ) {
      return next();
    }

    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: `Permission '${requiredPermission}' denied for role '${userRole}'` },
    });
  };
}
