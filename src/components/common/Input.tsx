
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  const baseClasses = "w-full p-3 bg-slate-800 border border-slate-600 rounded-md focus:ring-2 focus:ring-brand-cyan focus:outline-none transition-shadow duration-200 font-sans text-slate-200 placeholder-slate-500";
  
  return (
    <input className={`${baseClasses} ${className}`} {...props} />
  );
};
