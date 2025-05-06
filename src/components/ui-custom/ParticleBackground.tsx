
import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
  element: HTMLDivElement;
};

const ParticleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);
    const particles: Particle[] = [];

    const createParticle = () => {
      const particle = document.createElement("div");
      particle.className = "absolute rounded-full pointer-events-none";
      
      const size = Math.random() * 3 + 1;
      const x = Math.random() * container.offsetWidth;
      const y = Math.random() * container.offsetHeight;
      
      // Choose between blue and light gray for the particles
      const colors = ["rgba(26, 115, 232, 0.3)", "rgba(100, 116, 139, 0.2)"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const speedFactor = 0.4;
      const speedX = (Math.random() - 0.5) * speedFactor;
      const speedY = (Math.random() - 0.5) * speedFactor;
      const opacity = Math.random() * 0.5 + 0.1;

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.backgroundColor = color;
      particle.style.opacity = opacity.toString();
      
      container.appendChild(particle);

      return {
        x,
        y,
        size,
        speedX,
        speedY,
        color,
        opacity,
        element: particle
      };
    };

    // Initial creation of particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }
    
    particlesRef.current = particles;

    const animate = () => {
      particles.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Bounce off edges
        if (particle.x <= 0 || particle.x >= container.offsetWidth) {
          particle.speedX *= -1;
        }
        
        if (particle.y <= 0 || particle.y >= container.offsetHeight) {
          particle.speedY *= -1;
        }
        
        // Update DOM element position
        particle.element.style.left = `${particle.x}px`;
        particle.element.style.top = `${particle.y}px`;
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      particles.forEach(particle => {
        if (particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
      });
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-gradient-to-br from-background to-luxai-blue-light"
      aria-hidden="true"
    ></div>
  );
};

export default ParticleBackground;
