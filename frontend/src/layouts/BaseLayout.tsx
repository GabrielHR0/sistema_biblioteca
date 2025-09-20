import React from "react";
import { AdminNavbar } from "../components/admin/AdminNavbar";
import { PublicNavbar } from "../components/public/PublicNavbar";

interface BaseLayoutProps {
  children: React.ReactNode;
  userName: string;
  isAdmin: boolean;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children, userName, isAdmin }) => {
  return (
    <div>
      {isAdmin ? <AdminNavbar userName={userName}/> : <PublicNavbar userName={userName}/>}
      <main className="container py-4">{children}</main>
    </div>
  );
};
