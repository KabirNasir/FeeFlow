
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    // optional: decode token to get user info
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
// import React, { createContext, useState, useEffect, useCallback } from 'react';
// import api from '../services/api';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(() => localStorage.getItem('token'));

//   // This effect runs only when the component first loads to set the auth header
//   useEffect(() => {
//     if (token) {
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     }
//   }, [token]);

//   // login is now stable and won't be recreated on every render
//   const login = useCallback((newToken) => {
//     localStorage.setItem('token', newToken);
//     api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
//     setToken(newToken);
//   }, []);

//   // logout is also stable and won't cause unnecessary re-renders
//   const logout = useCallback(() => {
//     localStorage.removeItem('token');
//     delete api.defaults.headers.common['Authorization'];
//     setToken(null);
//   }, []);

//   return (
//     <AuthContext.Provider value={{ token, login, logout }}>
//       {children}
//     </AuthContext.Provider> // <-- This is the corrected line
//   );
// };

// import React, { createContext, useState, useEffect } from 'react';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(localStorage.getItem('token'));

//   const login = (newToken) => {
//     localStorage.setItem('token', newToken);
//     setToken(newToken);
//   };
//   const logout = () => {
//     localStorage.removeItem('token');
//     setToken(null);
//   };

//   useEffect(() => {
//     // optional: decode token to get user info
//   }, [token]);

//   return (
//     <AuthContext.Provider value={{ token, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// frontend/src/contexts/AuthContext.js

// import React, { createContext, useState, useEffect, useCallback } from 'react'; // 1. Import useCallback
// import api from '../services/api';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkUser = async () => {
//       const token = localStorage.getItem('token');
//       if (token) {
//         try {
//           const res = await api.get('/auth/me');
//           setUser(res.data.data);
//         } catch (err) {
//           localStorage.removeItem('token');
//         }
//       }
//       setLoading(false);
//     };
//     checkUser();
//   }, []);

//   // 2. Wrap login in useCallback
//   const login = useCallback((token) => {
//     localStorage.setItem('token', token);
//     // Optionally decode token to set user immediately or wait for a redirect and `checkUser`
//   }, []);

//   // 3. Wrap logout in useCallback
//   const logout = useCallback(() => {
//     localStorage.removeItem('token');
//     setUser(null);
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };