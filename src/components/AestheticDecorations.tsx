import React from 'react';
import { motion } from 'motion/react';

export const CircuitBoard = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 800 800" 
    className={className}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      d="M100 100V200H200V300H400V200H500V100M600 700V600H700V500H500V600H400V700"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.1"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
    />
    <motion.circle
      cx="100" cy="100" r="4"
      fill="currentColor"
      fillOpacity="0.2"
      animate={{ r: [4, 6, 4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.circle
      cx="400" cy="700" r="4"
      fill="currentColor"
      fillOpacity="0.2"
      animate={{ r: [4, 6, 4] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
    />
    <path d="M0 400H100M700 400H800M400 0V100M400 700V800" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.05" />
  </svg>
);

export const AbstractBlobs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
    <motion.div
      style={{ willChange: 'transform' }}
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 90, 0],
        x: [0, 30, 0],
      }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-medical-teal/5 blur-[80px] rounded-full"
    />
    <motion.div
      style={{ willChange: 'transform' }}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, -45, 0],
        x: [0, -40, 0],
      }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-medical-blue/5 blur-[100px] rounded-full"
    />
  </div>
);

export const DataStream = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-around opacity-[0.03]">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        style={{ willChange: 'transform' }}
        initial={{ y: "-100%" }}
        animate={{ y: "200%" }}
        transition={{
          duration: Math.random() * 8 + 10,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 5,
        }}
        className="w-[1px] h-[300px] bg-gradient-to-b from-transparent via-medical-teal to-transparent"
      />
    ))}
  </div>
);

export const GridVector = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

export const GeometricDecoration = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      className="absolute top-1/4 right-1/4"
    >
      <svg width="400" height="400" viewBox="0 0 400 400">
        <motion.circle
          cx="200" cy="200" r="150"
          stroke="white"
          strokeWidth="1"
          strokeDasharray="5,15"
          fill="none"
        />
        <motion.rect
          x="100" y="100" width="200" height="200"
          stroke="white"
          strokeWidth="1"
          fill="none"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </motion.div>
  </div>
);
