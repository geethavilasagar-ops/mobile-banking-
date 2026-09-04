// ─── Navigation Types ──────────────────────────────────────────────────────
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  PersonalInfo: undefined;
  EmailOTP: { userId: string; email: string };
  SelectBank: { userId: string };
  ActivationMethod: { userId: string; bankId: string; bankName: string };
  LinkCard: { userId: string; bankId: string };
  CardOTP: { userId: string };
  Aadhaar: { userId: string };
  AadhaarOTP: { userId: string };
  CreatePIN: { userId: string };
  Success: undefined;
  Dashboard: undefined;
  SendMoney: undefined;
};

// ─── API Types ─────────────────────────────────────────────────────────────
export interface APIResponse<T = Record<string, unknown>> {
  success: boolean;
  message: string;
  data: T;
}

export interface Bank {
  _id: string;
  name: string;
  code: string;
  abbreviation: string;
  color: string;
  isActive: boolean;
}

export interface RegisterResponse {
  token: string;
  userId: string;
}
