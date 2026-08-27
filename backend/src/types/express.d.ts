import { Role } from '@prisma/client';

export interface JwtPayloadUser {
  userId: string;
  email: string;
  role: Role;
  businessId: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadUser;
      businessId?: string;
    }
  }
}
