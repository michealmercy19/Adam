import React from 'react';

export const Badge = ({ text, type = 'default' }) => {
  return <span className={`badge ${type}`}>{text}</span>;
};

export const Pill = ({ text }) => {
  return <span className="pill">{text}</span>;
};

export const Card = ({ children, className = '' }) => {
  return <div className={`card ${className}`}>{children}</div>;
};

export const Button = ({ 
  children, 
  onClick, 
  type = 'primary', 
  disabled = false,
  ...props 
}) => {
  return (
    <button 
      className={type} 
      onClick={onClick} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const Grid = ({ children, cols = 4 }) => {
  const gridClass = cols === 2 ? 'two' : cols === 3 ? 'three' : 'grid';
  return <div className={gridClass}>{children}</div>;
};
