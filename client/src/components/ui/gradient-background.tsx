import React from 'react';

interface GradientBackgroundProps {
  children: React.ReactNode;
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background relative overflow-hidden">
      {/* Abstract shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Floating gradient blobs */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full opacity-10 bg-gradient-to-r from-primary/30 to-primary/10 blur-3xl"></div>
        <div className="absolute top-[30%] right-[-20%] w-[600px] h-[600px] rounded-full opacity-10 bg-gradient-to-l from-purple-500/20 to-indigo-400/10 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full opacity-10 bg-gradient-to-tr from-primary/30 to-primary/5 blur-3xl"></div>
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-5" 
          style={{ 
            backgroundSize: '50px 50px', 
            backgroundImage: 'linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)' 
          }}
        ></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}