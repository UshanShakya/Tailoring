import { Request, Response } from 'express';
import { performGlobalSearch } from './search.service';

export async function searchHandler(req: Request, res: Response) {
  try {
    const q = req.query.q as string | undefined;
    const userRoleName = req.user?.roleName;
    const userPermissions = (req.user?.permissions as string[]) || [];

    const results = await performGlobalSearch(req.businessId || null, userRoleName, userPermissions, q || '');
    return res.json(results);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Global search failed' },
    });
  }
}
