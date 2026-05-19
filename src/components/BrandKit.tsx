
import React from 'react';

export const Colors = {
  warmIvory: '#F7F3EE',
  coffeeSatin: '#4B362F',
  softGray: '#999999',
  gladeGreen: '#66806A',
  metallicGold: '#D4AF37',
  oldCopper: '#7B4B3A',
  rodeoDust: '#C7A19A'
};

export const Logo = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizes = {
    sm: 'text-sm tracking-[0.25em]',
    md: 'text-xl tracking-[0.4em]',
    lg: 'text-4xl tracking-[0.5em]'
  };
  
  return (
    <div className={`flex items-center font-medium ${sizes[size]} text-coffee-satin ${className}`}>
      MGNOVA
    </div>
  );
};
