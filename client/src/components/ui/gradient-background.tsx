import React from 'react';

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientBackground({ children, className = '' }: GradientBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Gradient orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-indigo-500 opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400 opacity-10 rounded-full blur-3xl"></div>
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' viewBox=\'0 0 30 30\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z\' fill=\'rgba(0,0,0,0.07)\'/%3E%3C/svg%3E")',
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}