import React, { useState } from "react";

import "../css/Navbar.css";
import { Link, NavLink } from "react-router-dom";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <NavLink to="/" className="nav-link">Home</NavLink>
        </li>
        <li>
          <NavLink to="/search" className="nav-link">Search</NavLink>
        </li>
        <li>
          <NavLink to="/categories" className="nav-link">Categories</NavLink>
        </li>
        <li>
          <NavLink to="/request" className="nav-link">Send a Request</NavLink>
        </li>
        <li>
          <NavLink to="/help" className="nav-link">Help</NavLink>
        </li>
        <li>
          <NavLink to="/login" className="nav-login">Log in</NavLink>
        </li>
        <li>
          <NavLink to="/signup"className="nav-cta">Get Started</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
