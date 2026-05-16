export type Role = "Employee" | "Manager (L1)" | "Admin / HR";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  managerId: string | null;
}
