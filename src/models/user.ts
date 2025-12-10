export interface User {
  avatar: string | undefined;
  id: number;
  username: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  address: string | null;
  gender: string | null;
  dateOfBirth: string | null;
}
