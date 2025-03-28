"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const AnimatedBackground = () => {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0 bg-brand-dark" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-brand-dark">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.08) 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.4, 0.6],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at ${
              mousePosition.x * 0.8
            }px ${
              mousePosition.y * 0.8
            }px, rgba(255, 255, 255, 0.1) 0%, transparent 15%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute h-[2px] w-full opacity-20 overflow-hidden"
          style={{
            top: `calc(${mousePosition.y}px - 1px)`,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(120, 200, 255, 0.8) 50%, transparent 100%)",
          }}
          animate={{
            left: ["-100%", "200%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute w-[2px] h-full opacity-20 overflow-hidden"
          style={{
            left: `calc(${mousePosition.x}px - 1px)`,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(180, 140, 255, 0.8) 50%, transparent 100%)",
          }}
          animate={{
            top: ["-100%", "200%"],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute inset-0"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg className="w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4">
            <defs>
              <linearGradient
                id="grid-highlight-1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#5661E8" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#5661E8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#5661E8" stopOpacity="0.1" />
              </linearGradient>
              <pattern
                id="spiral-grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(0)"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-gray-400/20"
                />
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="url(#grid-highlight-1)"
                  strokeWidth="1.5"
                  strokeOpacity="0.15"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#spiral-grid)" />
          </svg>
        </motion.div>
        <motion.div
          className="absolute inset-0"
          initial={{ rotate: 0 }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg className="w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 opacity-60">
            <defs>
              <linearGradient
                id="grid-highlight-2"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#41E1E0" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#41E1E0" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#41E1E0" stopOpacity="0.1" />
              </linearGradient>
              <pattern
                id="spiral-grid-2"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.6"
                  className="text-gray-400/15"
                />
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="url(#grid-highlight-2)"
                  strokeWidth="1.5"
                  strokeOpacity="0.1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#spiral-grid-2)" />
          </svg>
        </motion.div>
        <motion.div
          className="absolute inset-0 opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
        >
          <svg className="w-full h-full">
            <defs>
              <radialGradient
                id="grid-glow"
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <stop offset="0%" stopColor="#89F7FE" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#66A6FF" stopOpacity="0" />
              </radialGradient>
              <pattern
                id="grid"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 30 0 L 0 0 0 30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.7"
                  className="text-gray-300"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect
              width="100%"
              height="100%"
              fill="url(#grid-glow)"
              opacity="0.05"
            />
          </svg>
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-indigo-500/2 via-gray-400/5 to-cyan-500/2"
          animate={{
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};
