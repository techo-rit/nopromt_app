
import React, { useRef } from 'react';
import type { Template } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface TrendingCarouselProps {
    templates: Template[];
    onSelectTemplate: (template: Template) => void;
}

export const TrendingCarousel: React.FC<TrendingCarouselProps> = ({ templates, onSelectTemplate }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            // Updated scroll calculation: Card Width (450) + Gap (32)
            const cardWidth = 450; 
            const gap = 32;
            const scrollAmount = direction === 'left' ? -(cardWidth + gap) : (cardWidth + gap);
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, template: Template) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectTemplate(template);
        }
    };

    return (
        <section className="bg-white py-8 relative">
            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-12 relative group/section">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[clamp(2.5rem,5vw,3.5rem)] font-bold tracking-tight leading-[1.1] text-[#1d1d1f] py-8 text-left">
                        Trending Now.
                    </h2>
                </div>

                <div className="relative">
                    {/* Left Navigation Button - Desktop Only */}
                    <button 
                        onClick={() => scroll('left')}
                        className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/80 backdrop-blur-md rounded-full shadow-md border border-black/5 items-center justify-center text-black hover:bg-white hover:scale-105 transition-all duration-200 focus:outline-none opacity-0 group-hover/section:opacity-100 disabled:opacity-0"
                        aria-label="Scroll left"
                    >
                        <ChevronLeftIcon />
                    </button>

                    {/* Scroll Container */}
                    <div 
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-8 snap-x snap-mandatory scroll-smooth scrollbar-hide px-4 py-4 -mx-4 md:mx-0 md:px-0"
                    >
                        {templates.map(template => (
                            <div
                                key={template.id}
                                className="snap-center shrink-0 first:pl-2 last:pr-2"
                            >
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onSelectTemplate(template)}
                                    onKeyDown={(e) => handleKeyDown(e, template)}
                                    aria-label={`Select trending template: ${template.name}`}
                                    className="
                                        w-[85vw] md:w-[450px] aspect-square
                                        rounded-[32px] overflow-hidden
                                        relative group cursor-pointer
                                        transform transition-transform duration-500 ease-out hover:scale-[1.02]
                                        bg-gray-100
                                    "
                                >
                                    <img 
                                        src={template.imageUrl} 
                                        alt={template.name} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    
                                    {/* Gradient and Text Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                                    <div className="absolute bottom-0 left-0 p-8 w-full">
                                        <h3 className="text-white text-[1.85rem] font-bold leading-tight drop-shadow-sm tracking-tight">
                                            {template.name}
                                        </h3>
                                        <p className="text-white/90 text-base font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                            Remix this look
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Navigation Button - Desktop Only */}
                    <button 
                         onClick={() => scroll('right')}
                         className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/80 backdrop-blur-md rounded-full shadow-md border border-black/5 items-center justify-center text-black hover:bg-white hover:scale-105 transition-all duration-200 focus:outline-none opacity-0 group-hover/section:opacity-100"
                         aria-label="Scroll right"
                    >
                        <ChevronRightIcon />
                    </button>
                </div>
            </div>
        </section>
    );
};

// CSS for hiding scrollbars
const style = document.createElement('style');
style.textContent = `
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
`;
if (!document.head.contains(style)) {
    document.head.append(style);
}
