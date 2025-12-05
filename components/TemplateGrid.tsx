
import React from 'react';
import type { Template } from '../types';

interface TemplateGridProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({ templates, onSelectTemplate }) => {
  const handleKeyDown = (e: React.KeyboardEvent, template: Template) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectTemplate(template);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full pb-12">
      {templates.map(template => (
        <div
          key={template.id}
          // Responsive Hero Card Logic:
          // Width: 100% of parent, capped at 1200px.
          // Height: Mobile (280px) -> Tablet (360px) -> Desktop (480px).
          className="group relative w-full max-w-[1200px] h-[280px] md:h-[360px] lg:h-[480px] cursor-pointer rounded-[2rem] overflow-hidden shadow-xl transition-all duration-500 ease-out transform hover:scale-[1.01] hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-500"
          role="button"
          tabIndex={0}
          aria-label={`Select template: ${template.name}`}
          onClick={() => onSelectTemplate(template)}
          onKeyDown={(e) => handleKeyDown(e, template)}
        >
          <img 
            src={template.imageUrl} 
            alt={template.name} 
            className="w-full h-full object-cover object-[center_50%] transition-transform duration-700 group-hover:scale-105"
            loading="lazy" 
          />
          
          {/* Cinematic gradient overlay: Bottom dark -> Top transparent */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
          
          {/* Text Content */}
          <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full transform transition-transform duration-300">
            <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2 drop-shadow-md leading-tight">
              {template.name}
            </h3>
            <p className="text-white/90 text-sm md:text-base font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
              Tap to remix
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
