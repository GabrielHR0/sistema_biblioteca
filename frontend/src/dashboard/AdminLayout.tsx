import type { ReactNode } from "react";
import { AdminNavbar } from "./AdminNavbar";

interface AdminLayoutProps {
  children: ReactNode;
  userName: any;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, userName }) => {
  return (
    <div>
      <AdminNavbar userName={userName} />
      <main className="container-fluid">{children}</main>
    </div>
  );
};
