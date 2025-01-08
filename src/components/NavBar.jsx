import React, { useContext, useState, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { UserContext } from "./UserContext";
import "../css/Navbar.css";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown state
  const dropdownRef = useRef(null); // Reference for dropdown width
  const { user, setUser, loading } = useContext(UserContext);

  const handleLogout = () => {
    fetch("http://localhost/Sal7ly/php_backend/logout.php", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUser(null);
        }
      })
      .catch((error) => console.error("Error during logout:", error));
  };

  if (loading) {
    // Optionally display a loading indicator or placeholder
    return <div>Loading...</div>;
  }

  return (
    <nav>
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
          <NavLink to="/request" className="nav-link">
            Send a Request
          </NavLink>
        </li>
        <li>
          <NavLink to="/help" className="nav-link">
            Help
          </NavLink>
        </li>
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
                  width: dropdownRef.current?.offsetWidth, // Match the width of the button
                }}
              >
                <button onClick={handleLogout} className="dropdown-item">
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
