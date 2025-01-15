import React, { useContext, useState, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { UserContext } from "./UserContext";
import "../css/Navbar.css";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown state
  const dropdownRef = useRef(null); // Reference for dropdown width
  const { user, setUser, loading } = useContext(UserContext); // Use loading from context

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
    return <nav>Loading...</nav>;
  }

  return (
    <nav className="mainNav">
      <Link to="/" className="title">
        صلحلي
      </Link>
      <div className="menu" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul className={menuOpen ? "open" : ""}>
        <li>
          <NavLink to="/" className="nav-link">
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/search" className="nav-link">
            Search
          </NavLink>
        </li>
        <li>
          <NavLink to="/categories" className="nav-link">
            Categories
          </NavLink>
        </li>
        <li>
          <NavLink
            to={user?.userType === "craftsman" ? "/showrequests" : "/request"}
            className="nav-link"
          >
            {user?.userType === "craftsman" ? "Show Requests" : "Send a Request"}
          </NavLink>
        </li>
        <li>
          <NavLink to="/help" className="nav-link">
            Help
          </NavLink>
        </li>
        {user && (
          <li>
            <NavLink to="/projects" className="nav-link">
              Projects
            </NavLink>
          </li>
        )}
        {user ? (
          <li className="user-dropdown">
            <button
              ref={dropdownRef}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`user-button ${dropdownOpen ? "active" : ""}`}
            >
              {user.name}
            </button>
            {dropdownOpen && (
              <div
                className="dropdown-menu"
                style={{
                  width: dropdownRef.current?.offsetWidth,
                }}
              >
                <button
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }}
                  className="dropdown-item"
                >
                  Logout
                </button>
              </div>
            )}
          </li>
        ) : (
          <>
            <li>
              <NavLink to="/login" className="nav-login">
                Log in
              </NavLink>
            </li>
            <li>
              <NavLink to="/signup" className="nav-cta">
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