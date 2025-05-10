import React, { useEffect, useRef } from 'react';

// Particle interface
interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  color: string;
  alpha: number;
}

const FlowingBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  
  // Initialize particles and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to full screen
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Initialize particles
    function initParticles() {
      particles.current = [];
      const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 25000));
      
      for (let i = 0; i < particleCount; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speed: Math.random() * 0.7 + 0.1,
          angle: Math.random() * 2 * Math.PI,
          color: getGradientColor(Math.random()),
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    }
    
    // Generate gradient colors
    function getGradientColor(value: number): string {
      // Purple to Cyan gradient
      const r = Math.floor(125 * (1 - value) + 64 * value);
      const g = Math.floor(50 * (1 - value) + 224 * value);
      const b = Math.floor(200 * (1 - value) + 208 * value);
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Animation loop
    function animate() {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.current.forEach(particle => {
        // Update position
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;
        
        // Boundary check and bounce
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.angle = Math.PI - particle.angle;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.angle = -particle.angle;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        ctx.fill();
      });
      
      // Draw connecting lines
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#a3a8c3';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const p1 = particles.current[i];
          const p2 = particles.current[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Only connect nearby particles
          if (distance < canvas.width / 10) {
            const opacity = 1 - (distance / (canvas.width / 10));
            ctx.globalAlpha = opacity * 0.2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    initParticles();
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full -z-10"
      style={{ 
        background: 'linear-gradient(145deg, rgba(10,10,30,1) 0%, rgba(20,20,55,1) 100%)' 
      }}
    />
  );
};

export default FlowingBackground;