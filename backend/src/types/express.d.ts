export interface JwtPayloadUser {
  userId: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: string[];
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
