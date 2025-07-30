import React from "react";
import "../App.css";

const Header: React.FC = () => (
  <header style={{
    width: '100%',
    padding: '1rem 0',
    background: '#eee',
    color: '#333',
    marginBottom: '2rem',
    borderBottom: '2px dashed #aaa',
    textAlign: 'left',
    fontFamily: 'monospace',
  }}>
    <h1 style={{ margin: 0, fontWeight: 400, fontSize: '1.5rem', letterSpacing: '0.01em' }}>
      just trying to learn how this user-basic-auth thing is structured lol
    </h1>
  </header>
);

export default Header;
