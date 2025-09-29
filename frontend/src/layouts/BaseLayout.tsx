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
      {/* Ambas as navbars como sidebars fixas */}
      {isAdmin ? (
        <AdminNavbar userName={userName} />
      ) : (
        <PublicNavbar userName={userName} />
      )}
      
      <div className="flex-grow-1" style={{ 
        marginLeft: "250px", // Ambas as navbars têm 250px
        minHeight: "100vh",
        transition: "margin-left 0.3s ease",
        backgroundColor: "#f8f9fa"
      }}>
        <main className="p-3 p-md-4" style={{
          minHeight: "100vh"
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