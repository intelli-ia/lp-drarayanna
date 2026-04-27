'use client';

import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navContainer">
        <div className="logo">
          Dra. Rayanna<span> Almeida</span>
        </div>
        
        <div className="navLinks">
          <a href="#hero">Início</a>
          <a href="#manifesto">Manifesto</a>
          <a href="#metodo">Método</a>
          <a href="#quem-sou">Quem sou</a>
          <a href="#faq">Dúvidas</a>
          <a href="https://wa.me/557181551023?text=Olá!%20Vim%20do%20site%20e%20gostaria%20de%20saber%20mais" target="_blank" className="cta">Agende Agora</a>
        </div>
        
        {/* Simple mobile indicator for now */}
        <div className="mobileMenuBtn">
          Menu
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
