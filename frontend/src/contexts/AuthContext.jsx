import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start in a loading state
  const [token, setToken] = useState(localStorage.getItem('token'));

  // This effect runs ONCE on app load to verify the user from any existing token
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setToken(token);

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // <-- ADD THIS LINE

        try {
          // Ask the backend "who is this token for?"
          setToken(token);

          const res = await api.get('/auth/me');
          // If successful, we have a valid user
          setUser(res.data.data);
        } catch (err) {
          // If the token is invalid (e.g., expired), remove it
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);

        }
      }
      // Finished verification, we can now show the app
      setLoading(false);
    };

    verifyUser();
  }, []); // The empty dependency array ensures this runs only once

  const login = async (token, userData) => {
    localStorage.setItem('token', token);
    setToken(token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const res = await api.get('/auth/me');
    setUser(res.data.data);
 
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  // Do not render the main app until the user verification is complete
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading Application...</h2>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token ,login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
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
