export interface AuthResponse {
  userName: string;
  email: string;
  Roles: string[];  // <-- Capital "R"
  token: string;
    userId: string; // ← أضف هذا السطر

}