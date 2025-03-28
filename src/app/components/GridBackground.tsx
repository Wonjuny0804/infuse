"use client";

import React from "react";

export const GridBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-gray-100">
        <svg className="w-full h-full">
          <defs>
            <pattern
              id="grid-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-gray-300/30"
              />
            </pattern>
            <linearGradient
              id="grid-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#4F46E5" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          <rect
            width="100%"
            height="100%"
            fill="url(#grid-gradient)"
            opacity="0.3"
            style={{ mixBlendMode: "overlay" }}
          />
        </svg>
      </div>
    </div>
  );
};
