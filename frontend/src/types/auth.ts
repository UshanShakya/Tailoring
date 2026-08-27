export type Role = 'SUPER_ADMIN' | 'BUSINESS_ADMIN' | 'STAFF_FULL' | 'STAFF_BASIC';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessId: string | null;
  businessName?: string | null;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}
