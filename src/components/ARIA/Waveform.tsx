import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  state: 'idle' | 'listening' | 'processing' | 'speaking';
  isMuted?: boolean;
}

export const Waveform: React.FC<WaveformProps> = ({ state, isMuted }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.beginPath();
      ctx.lineWidth = 3;
      
      let color = '#00FFD1'; // Teal
      let amplitude = 10;
      let frequency = 0.05;
      let bars = 40;

      if (state === 'listening') {
        color = '#0066FF'; // Blue
        amplitude = 30 + Math.random() * 20;
        frequency = 0.1;
      } else if (state === 'processing') {
        color = '#00FFD1';
        amplitude = 15;
        frequency = 0.08;
        offset += 0.1;
      } else if (state === 'speaking') {
        color = '#00FFD1';
        amplitude = 25 + Math.sin(Date.now() / 100) * 15;
        frequency = 0.07;
      } else {
        // Idle
        amplitude = 5;
        frequency = 0.03;
      }

      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, color + '00');
      gradient.addColorStop(0.5, color);
      gradient.addColorStop(1, color + '00');
      ctx.strokeStyle = gradient;

      for (let i = 0; i < bars; i++) {
        const x = (width / bars) * i;
        const distFromCenter = Math.abs(i - bars / 2) / (bars / 2);
        const factor = 1 - distFromCenter;
        
        let barHeight = amplitude * factor;
        
        if (state === 'idle') {
          barHeight *= Math.sin(offset + i * frequency);
        } else if (state === 'listening' || state === 'speaking') {
          barHeight *= 0.5 + Math.random();
        } else {
           barHeight *= Math.sin(offset + i * frequency);
        }

        ctx.moveTo(x, centerY - barHeight);
        ctx.lineTo(x, centerY + barHeight);
      }

      ctx.stroke();
      offset += 0.05;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [state]);

  return (
    <div className="relative w-full h-32 flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={100} 
        className="w-full h-full"
      />
      {state === 'processing' && (
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-12 h-12 border-2 border-medical-teal border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
