export type User = {
  id: string; // Hoặc number tùy DB
  username: string; // Code cũ dùng username
  email: string;
  roles?: string[]; // Code cũ có check role SADMIN, ORGANIZER
  avatar?: string;
  // Thêm các trường khác nếu cần
};
