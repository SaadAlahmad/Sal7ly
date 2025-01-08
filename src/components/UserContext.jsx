import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost/Sal7ly/php_backend/sessionhandler.php", {
          credentials: "include", // Include cookies in the request
        });
        if (response.ok) {
          const data = await response.json();
          if (data.loggedIn) {
            setUser({
              id: data.id, // Set user ID
              name: data.username,
              email: data.email,
            });
          } else {
            setUser(null);
          }
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
