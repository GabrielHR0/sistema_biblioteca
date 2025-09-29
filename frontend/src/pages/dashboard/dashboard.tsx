import React from "react";
import { AdminDashboard } from "./AdminDashboard";
import { PublicDashboard } from "./PublicDashboard";

interface DashboardProps {
  userName: string;
  isAdmin: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ userName, isAdmin }) => {
  return isAdmin ? (
    <AdminDashboard userName={userName} isAdmin={isAdmin} />
  ) : (
    <PublicDashboard userName={userName} isAdmin={isAdmin} />
  );
};