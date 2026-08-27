import { Request, Response } from 'express';
import { getDashboardStats } from './dashboard.service';

export async function getDashboardStatsHandler(req: Request, res: Response) {
  try {
    const stats = await getDashboardStats(req.businessId || null);
    return res.json(stats);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch dashboard stats' },
    });
  }
}
