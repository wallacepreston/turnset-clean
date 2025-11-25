import React from "react";

export const LogoTurnsetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  // Generate unique ID for gradient to avoid conflicts when multiple logos are on the page
  const gradientId = React.useId();
  
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      {...props}
    >
      <defs>
        <linearGradient id={`primaryGradient-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop stopColor="#6366F1" offset="0" />
          <stop stopColor="#06B6D4" offset="1" />
        </linearGradient>
      </defs>
      <g
        transform="matrix(1.0,0,0,1.0,-4,-18)"
        fill={`url(#primaryGradient-${gradientId})`}
      >
        <path d="M21.42 37.08 l2.28 -8.34 l24.96 0 l-2.28 8.34 l-16.62 0 l-5.94 22.2 l-8.34 0 z M13.14 37.08 l2.28 -8.34 l-8.34 0 l-2.28 8.34 l8.34 0 z" />
      </g>
    </svg>
  );
};

