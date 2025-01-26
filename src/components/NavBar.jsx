import React, { useContext, useState, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { UserContext } from "./UserContext";
import "../css/Navbar.css";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, setUser, loading } = useContext(UserContext);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost/Sal7ly/php_backend/logout.php", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setUser(null);
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (loading) {
    return <nav className="navbar">Loading...</nav>;
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__title">
        صلحلي
      </Link>
      <div className="navbar__menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <span className="navbar__menu-line"></span>
        <span className="navbar__menu-line"></span>
        <span className="navbar__menu-line"></span>
      </div>
      <ul className={`navbar__list ${menuOpen ? "navbar__list--open" : ""}`}>
        <li className="navbar__item">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
          >
            Home
          </NavLink>
        </li>
        <li className="navbar__item">
          <NavLink 
            to="/search" 
            className={({ isActive }) => 
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
          >
            Search
          </NavLink>
        </li>
        <li className="navbar__item">
          <NavLink 
            to="/categories" 
            className={({ isActive }) => 
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
          >
            Categories
          </NavLink>
        </li>
        {user?.userType !== "admin" && (
          <li className="navbar__item">
            <NavLink
              to={user?.userType === "craftsman" ? "/showrequests" : "/request"}
              className={({ isActive }) => 
                isActive ? "navbar__link navbar__link--active" : "navbar__link"
              }
            >
              {user?.userType === "craftsman" ? "Show Requests" : "Send a Request"}
            </NavLink>
          </li>
        )}
        <li className="navbar__item">
          <NavLink 
            to="/help" 
            className={({ isActive }) => 
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
          >
            Help
          </NavLink>
        </li>
        {user && user.userType !== "admin" && (
          <li className="navbar__item">
            <NavLink 
              to="/projects" 
              className={({ isActive }) => 
                isActive ? "navbar__link navbar__link--active" : "navbar__link"
              }
            >
              Projects
            </NavLink>
          </li>
        )}
        {user?.userType === "admin" && (
          <li className="navbar__item">
            <NavLink 
              to="/admin" 
              className={({ isActive }) => 
                isActive ? "navbar__link navbar__link--active" : "navbar__link"
              }
            >
              Admin
            </NavLink>
          </li>
        )}
        {user ? (
          <li className="navbar__user-dropdown">
            <button
              ref={dropdownRef}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`navbar__user-button ${dropdownOpen ? "navbar__user-button--active" : ""}`}
            >
              {user.name}
            </button>
            {dropdownOpen && (
              <div 
                className="navbar__dropdown-menu"
                style={{ width: dropdownRef.current?.offsetWidth }}
              >
                <button
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }}
                  className="navbar__dropdown-item"
                >
                  Logout
                </button>
              </div>
            )}
          </li>
        ) : (
          <>
            <li className="navbar__item">
              <NavLink 
                to="/login" 
                className="navbar__auth-link navbar__auth-link--login"
              >
                Log in
              </NavLink>
            </li>
            <li className="navbar__item">
              <NavLink 
                to="/signup" 
                className="navbar__auth-link navbar__auth-link--cta"
              >
                Get Started
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;