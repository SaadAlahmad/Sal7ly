import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost/Sal7ly/php_backend/sessionhandler.php", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          // console.log("Fetched user data:", data);
          if (data.loggedIn) {
            const userData = {
              id: data.id, 
              name: data.name,
              email: data.email,
              userType: data.userType,
            }
            if (data.userType === 'craftsman') {
              userData.city = data.city;
              userData.category = data.category;
            }

            setUser(userData);
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
