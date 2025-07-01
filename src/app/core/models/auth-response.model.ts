export interface AuthResponse {
  username: string;
  email: string;
  Roles: string[];  // <-- Capital "R"
  token: string;
    userId: string; // ← أضف هذا السطر

}