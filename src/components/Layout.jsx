import React from 'react';
import NavBar from './NavBar';
import '../css/Layout.css'

const Layout = ({ children }) => {
  return (
    <>
      <div className='navdiv'>
        <NavBar />
      </div>
      <main>{children}</main>
    </>
  );
};

export default Layout;
