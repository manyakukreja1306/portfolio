import React from 'react';
import './Header.css';  // Import the CSS for styling

function Header() {
  return (
    <div className="topnav">
      <a className="active" href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#contact">Contact</a>
      <a href="#home">Home</a>
    </div>
  );
}

export default Header;
