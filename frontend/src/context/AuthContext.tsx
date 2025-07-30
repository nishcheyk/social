
// import React, { createContext, useState } from "react";
// import type { ReactNode } from "react";
// import { loginUser, registerUser } from "../api/auth.api";
// import type { AuthResponse, LoginPayload, RegisterPayload } from "../api/auth.api";

// interface AuthContextType {
//   user: AuthResponse["user"] | null;
//   accessToken: string | null;
//   login: (payload: LoginPayload) => Promise<void>;
//   register: (payload: RegisterPayload) => Promise<void>;
//   logout: () => void;
// }

// export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<AuthContextType["user"]>(null);
//   const [accessToken, setAccessToken] = useState<string | null>(null);

//   const login = async (payload: LoginPayload) => {
//     const data = await loginUser(payload);
//     setUser(data.user);
//     setAccessToken(data.accessToken);
//   };

//   const register = async (payload: RegisterPayload) => {
//     const data = await registerUser(payload);
//     setUser(data.user);
//     setAccessToken(data.accessToken);
//   };

//   const logout = () => {
//     setUser(null);
//     setAccessToken(null);
//     // Optional: clear storage tokens here
//   };

//   return (
//     <AuthContext.Provider value={{ user, accessToken, login, register, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
import React, { createContext, useState, useContext, ReactNode } from "react";

interface User {
  _id: string;
  email: string;
  username?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  userId?: string;
  sessionId?: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = async (payload: LoginPayload) => {
  
    throw new Error("Replace login with actual API call");
  };

  const register = async (payload: RegisterPayload) => {
    throw new Error("Replace register with actual API call");
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
