export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
  isSystem?: boolean;
}

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
