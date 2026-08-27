import { Request, Response } from 'express';
import { loginSchema, refreshSchema, loginUser, refreshTokens, getUserProfile } from './auth.service';

export async function loginHandler(req: Request, res: Response) {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginUser(validatedData);
    return res.json(result);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid input data' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'An internal error occurred' },
    });
  }
}

export async function refreshHandler(req: Request, res: Response) {
  try {
    const validatedData = refreshSchema.parse(req.body);
    const result = await refreshTokens(validatedData.refreshToken);
    return res.json(result);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid refresh token payload' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'UNAUTHORIZED', message: err.message || 'Invalid refresh token' },
    });
  }
}

export async function meHandler(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      });
    }
    const profile = await getUserProfile(req.user.userId);
    return res.json(profile);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'An internal error occurred' },
    });
  }
}
