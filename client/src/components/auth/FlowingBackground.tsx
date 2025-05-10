import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Fluid particle animation using SVG and Framer Motion
const FlowingBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Background gradient animation
  const gradientVariants = {
    initial: {
      background: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
    },
    animate: {
      background: [
        'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
        'linear-gradient(135deg, #3a7bd5 0%, #2b5876 100%)',
        'linear-gradient(135deg, #4e4376 0%, #3a7bd5 100%)',
        'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
      ],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  // Generate fluid particle SVG elements with animation
  const renderFluidParticles = () => {
    const particles = [];
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      // Random properties for diverse particle motion
      const scale = Math.random() * 0.3 + 0.3;
      const duration = Math.random() * 15 + 20;
      const initialDelay = Math.random() * 5;
      const x = Math.random() * 100;
      const y = Math.random() * 100;

      particles.push(
        <motion.path
          key={i}
          d="M25,50 a25,25 0 1,1 50,0 a25,25 0 1,1 -50,0"
          fill="rgba(255, 255, 255, 0.1)"
          initial={{ 
            scale: scale, 
            x: `${x}%`, 
            y: `${y}%`,
            filter: 'blur(20px)'
          }}
          animate={{ 
            scale: [scale, scale * 1.2, scale],
            x: [`${x}%`, `${(x + 20) % 100}%`, `${x}%`],
            y: [`${y}%`, `${(y + 20) % 100}%`, `${y}%`],
          }}
          transition={{ 
            duration: duration, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: initialDelay,
          }}
        />
      );
    }

    return particles;
  };

  // Render dynamic connection lines
  const renderConnections = () => {
    const connections = [];
    const connectionCount = 6;

    for (let i = 0; i < connectionCount; i++) {
      const x1 = Math.random() * 100;
      const y1 = Math.random() * 100;
      const x2 = Math.random() * 100;
      const y2 = Math.random() * 100;
      const duration = Math.random() * 20 + 30;
      const delay = Math.random() * 5;

      connections.push(
        <motion.path
          key={`connection-${i}`}
          d={`M${x1},${y1} Q${(x1 + x2) / 2 + Math.random() * 20 - 10},${
            (y1 + y2) / 2 + Math.random() * 20 - 10
          } ${x2},${y2}`}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="2"
          fill="transparent"
          initial={{ pathLength: 0 }}
          animate={{ 
            pathLength: [0, 1, 0],
            pathOffset: [0, 0.5, 1],
          }}
          transition={{ 
            duration: duration, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: delay,
          }}
        />
      );
    }

    return connections;
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden z-0"
    >
      <motion.div 
        className="absolute inset-0 w-full h-full"
        variants={gradientVariants}
        initial="initial"
        animate="animate"
      >
        {/* SVG particles layer */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {renderFluidParticles()}
          {renderConnections()}
        </svg>
      </motion.div>
    </div>
  );
};

export default FlowingBackground;