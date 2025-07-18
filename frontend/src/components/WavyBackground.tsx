
import { useEffect, useRef } from 'react';

const WavyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.005;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create soft gradient background that matches the plant care theme
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.02)'); // emerald-500 very subtle
      gradient.addColorStop(0.3, 'rgba(34, 197, 94, 0.01)'); // green-500 very subtle  
      gradient.addColorStop(0.7, 'rgba(134, 239, 172, 0.015)'); // green-300 very subtle
      gradient.addColorStop(1, 'rgba(187, 247, 208, 0.02)'); // green-200 very subtle
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw subtle organic waves
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)'; // green-500 more subtle
      ctx.lineWidth = 1.5;
      
      // Organic flowing lines - more subtle and smooth
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        
        const amplitude = 80 + i * 30;
        const frequency = 0.002 + i * 0.001;
        const phase = time + i * 1.2;
        const yOffset = canvas.height * 0.2 + i * 120;
        
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = yOffset + 
                   Math.sin(x * frequency + phase) * amplitude +
                   Math.sin(x * frequency * 2 + phase * 0.8) * (amplitude * 0.2) +
                   Math.sin(x * frequency * 0.5 + phase * 1.5) * (amplitude * 0.4);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      }
      
      // Add very subtle floating organic particles
      ctx.fillStyle = 'rgba(34, 197, 94, 0.06)';
      for (let i = 0; i < 12; i++) {
        const x = (canvas.width / 13) * i + Math.sin(time * 0.3 + i * 0.8) * 60;
        const y = canvas.height * 0.3 + Math.cos(time * 0.2 + i * 1.2) * 100 + Math.sin(time * 0.4 + i) * 40;
        const size = 0.8 + Math.sin(time * 0.6 + i) * 0.4;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default WavyBackground;
