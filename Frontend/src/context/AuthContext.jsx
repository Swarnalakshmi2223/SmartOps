import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import socketService from "../services/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");

        return storedUser
            ? JSON.parse(storedUser)
            : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("token");
    });

    useEffect(() => {
        if (token) {
            socketService.connect(token);
        } else {
            socketService.disconnect();
        }
    }, [token]);

    useEffect(() => {
        const handleExpiredSession = () => {
            socketService.disconnect();
            setToken(null);
            setUser(null);
        };

        window.addEventListener("smartops:auth-expired", handleExpiredSession);
        return () => window.removeEventListener("smartops:auth-expired", handleExpiredSession);
    }, []);

    const login = async (email, password) => {

        const response = await api.post("/auth/login", {
            email,
            password
        });

        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setToken(token);
        setUser(user);

        return response.data;
    };

    const logout = () => {

        socketService.disconnect();
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    };
     
    const updateStoredUser = (updatedFields) => {
    const mergedUser = { ...user, ...updatedFields };

    localStorage.setItem("user", JSON.stringify(mergedUser));
    setUser(mergedUser);
};

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,           
                logout,
                updateStoredUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
