import React, { createContext, useContext, useState } from "react";
import { apiLogin } from "./authService";

interface AuthContextType {
    token: string | null;
    login: (email: string, password: string) => Promise<any>;
    logout: () => void;
}

const authContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

    const login = async (email: string, password: string) => {
        const data = await apiLogin(email, password);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        return data; 
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem("token");
    };

    return (
        <authContext.Provider value={{ token, login, logout }}>
            {children}
        </authContext.Provider>
    );
};

export const useAuth = () => useContext(authContext);
