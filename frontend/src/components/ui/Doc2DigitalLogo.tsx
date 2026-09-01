import React from 'react';

interface Doc2DigitalLogoProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function Doc2DigitalLogo({
  size = 22,
  color = '#4a7c59',
  className = '',
}: Doc2DigitalLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Document Folded Sheet Outline */}
      <path
        d="M 5 3 C 5 2.44772 5.44772 2 6 2 L 12.5 2 C 12.7652 2 13.0196 2.10536 13.2071 2.29289 L 17.7071 6.79289 C 17.8946 6.98043 18 7.23478 18 7.5 L 18 21 C 18 21.5523 17.5523 22 17 22 L 6 22 C 5.44772 22 5 21.5523 5 21 Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Top Corner Fold */}
      <path
        d="M 12.5 2 L 12.5 7 L 17.5 7"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Text Lines on Left */}
      <line x1="8" y1="10" x2="11.5" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="13.5" x2="11" y2="13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="17" x2="12" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Digital Circuit Nodes / Traces on Right */}
      {/* Trace 1 Top */}
      <path
        d="M 13 10 L 15 10 L 17.5 7.5 L 19 7.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20.5" cy="7.5" r="1.25" fill={color} />

      {/* Trace 2 Middle */}
      <path
        d="M 12.5 13.5 L 19.5 13.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="13.5" r="1.25" fill={color} />

      {/* Trace 3 Bottom */}
      <path
        d="M 13.5 17 L 15.5 17 L 17.5 19.5 L 19 19.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20.5" cy="19.5" r="1.25" fill={color} />
    </svg>
  );
}
