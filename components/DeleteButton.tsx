'use client';

import { useState } from 'react';

export function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [isPoofing, setIsPoofing] = useState(false);

  const handleClick = async () => {
    setIsPoofing(true);
    await onDelete();
    setTimeout(() => setIsPoofing(false), 2000);
  };

  return (
    <button 
      onClick={handleClick}
      className={`iconbutton ${isPoofing ? 'poof' : ''}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -10 18 28" className="w-5 h-5">
        <path d="M10.5,2.3V1.5c0,0,0-0.1,0-0.1C10.5,0.6,9.8,0,9,0H6c0,0-0.1,0-0.1,0C5.1,0,4.5,0.7,4.5,1.5v0.8H0v1.5h15V2.3H10.5z M9,2.2H6V1.5h3V2.2z" />
        <g>
          <path d="M12.8,3.8v12c0,0,0,0,0,0.1c0,0.4-0.4,0.7-0.8,0.7H3c0,0,0,0-0.1,0c-0.4,0-0.7-0.4-0.7-0.8v-12H0.8v12c0,0.6,0.2,1.2,0.7,1.6C1.8,17.8,2.4,18,3,18h9c0,0,0,0,0,0c1.2,0,2.2-1,2.2-2.2v-12H12.8z"/>
          <rect x="3.8" y="6" width="1.5" height="8.2"/>
          <rect x="6.8" y="6" width="1.5" height="8.2"/>
          <rect x="9.8" y="6" width="1.5" height="8.2"/>
        </g>
      </svg>
    </button>
  );
} 