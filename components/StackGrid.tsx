
import React from 'react';
import type { Stack } from '../types';

interface StackGridProps {
  stacks: Stack[];
  onSelectStack: (stack: Stack) => void;
}

export const StackGrid: React.FC<StackGridProps> = ({ stacks, onSelectStack }) => {
  const handleKeyDown = (e: React.KeyboardEvent, stack: Stack) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectStack(stack);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {stacks.map(stack => (
        <div
          key={stack.id}
          role="button"
          tabIndex={0}
          aria-label={`Select stack: ${stack.name}`}
          className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.03] hover:shadow-2xl hover:shadow-purple-500/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400"
          onClick={() => onSelectStack(stack)}
          onKeyDown={(e) => handleKeyDown(e, stack)}
        >
          <img src={stack.imageUrl} alt={stack.name} className="w-full h-full object-cover object-[center_25%]" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <h3 className="text-white text-3xl font-bold tracking-tight">{stack.name}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};
