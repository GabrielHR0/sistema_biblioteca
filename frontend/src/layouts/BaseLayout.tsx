import React from "react";
import { AdminNavbar } from "@components/admin/AdminNavbar";
import { PublicNavbar } from "@components/public/PublicNavbar";

interface BaseLayoutProps {
  children: React.ReactNode;
  userName: string;
  isAdmin: boolean;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children, userName, isAdmin }) => {
  return (
    <div className="d-flex">
      {isAdmin && <AdminNavbar userName={userName} />}
      
      <div className="flex-grow-1" style={{ 
        marginLeft: isAdmin ? "250px" : "0",
        minHeight: "100vh",
        transition: "margin-left 0.3s ease"
      }}>
        {!isAdmin && <PublicNavbar userName={userName} />}
        
        <main className="p-3 p-md-4" style={{
          minHeight: isAdmin ? "100vh" : "calc(100vh - 80px)",
          backgroundColor: "#f8f9fa"
        }}>
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body p-3 p-md-4">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};