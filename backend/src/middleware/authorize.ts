import { Request, Response, NextFunction } from 'express';

export function authorize(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      });
    }

    const userPermissions = req.user.permissions || [];

    // Global wildcard
    if (userPermissions.includes('*')) {
      return next();
    }

    // Business admin wildcard
    if (userPermissions.includes('*business_scoped*') && req.businessId) {
      return next();
    }

    // Domain wildcard check (e.g. "customer:*")
    const [domain] = requiredPermission.split(':');
    const domainWildcard = `${domain}:*`;

    if (
      userPermissions.includes(requiredPermission) ||
      userPermissions.includes(domainWildcard)
    ) {
      return next();
    }

    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: `Permission '${requiredPermission}' is not granted for your role (${req.user.roleName})`,
      },
    });
  };
}
