import React, { createContext, useContext, useState } from "react";
import { apiLogin } from "./authService";

interface User {
    id: number;
    name: string;
    email: string;
    // outros campos do usuário que precisar
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (email: string, password: string) => Promise<any>;
    logout: () => void;
}

const authContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string, password: string) => {
        const data = await apiLogin(email, password);
        setToken(data.token);
        const user = data.user;
        setUser({id: user.id, name: user.name, email: user.email});
        localStorage.setItem("token", data.token);
        return data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
    };

    return (
        <authContext.Provider value={{ token, user, login, logout }}>
            {children}
        </authContext.Provider>
    );
};

export const useAuth = () => useContext(authContext);
