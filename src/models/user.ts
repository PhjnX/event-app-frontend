export interface User {
  uid: string;
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
