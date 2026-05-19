
import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../utils/helpers';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-button disabled:opacity-50 active:scale-[0.98]";
  
  const variants = {
    primary: "bg-coffee-satin text-warm-ivory hover:bg-coffee-satin/90 shadow-sm",
    secondary: "bg-glade-green text-warm-ivory hover:bg-glade-green/90",
    outline: "border border-coffee-satin/20 text-coffee-satin hover:bg-coffee-satin/5",
    ghost: "text-coffee-satin hover:bg-coffee-satin/5"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white rounded-main border border-coffee-satin/5 p-6 transition-all duration-300 hover:shadow-premium bg-opacity-90",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};

export const Badge = ({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'gold' | 'green' | 'copper', className?: string }) => {
  const variants = {
    default: "bg-soft-gray/10 text-soft-gray",
    gold: "bg-metallic-gold/10 text-metallic-gold border border-metallic-gold/20",
    green: "bg-glade-green/10 text-glade-green",
    copper: "bg-old-copper/10 text-old-copper"
  };

  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider", variants[variant], className)}>
      {children}
    </span>
  );
};

export const Input = ({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-[10px] font-semibold uppercase tracking-wider text-soft-gray ml-1">{label}</label>}
      <input 
        className={cn(
          "bg-white border border-coffee-satin/10 rounded-input px-4 py-3 text-sm outline-none transition-all focus:border-coffee-satin/30 bg-opacity-80",
          className
        )}
        {...props}
      />
    </div>
  );
};

export const Section = ({ title, subtitle, children, className }: { title: string, subtitle?: string, children: React.ReactNode, className?: string }) => {
  return (
    <section className={cn("py-20 px-6", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-medium mb-3">{title}</h2>
          {subtitle && <p className="text-soft-gray max-w-2xl">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
};
