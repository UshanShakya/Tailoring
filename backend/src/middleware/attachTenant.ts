import { Request, Response, NextFunction } from 'express';

export function attachTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
    });
  }

  // Super Admin has businessId = null
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (!req.user.businessId) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'User is not assigned to any business tenant' },
    });
  }

  req.businessId = req.user.businessId;
  next();
}
