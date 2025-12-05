
import React from 'react';
import { RemixLogoIcon } from './Icons';

type NavCategory = 'Try on' | 'Creators';

interface HeaderProps {
    activeNav: NavCategory;
    onNavClick: (category: NavCategory) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeNav, onNavClick }) => {
    const navItems: NavCategory[] = ['Creators', 'Try on'];

    return (
        <header className="relative w-full h-[80px] bg-white border-b border-gray-200 z-50">
            <div className="w-full max-w-[1440px] mx-auto px-8 h-full flex items-center justify-between">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-black">
                        <RemixLogoIcon />
                        <span>nopromt.ai</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-4">
                        {navItems.map(item => (
                            <button
                                key={item}
                                onClick={() => onNavClick(item)}
                                aria-label={`Navigate to ${item} page`}
                                className={`px-5 py-2 text-base font-medium rounded-full transition-all duration-200 ease-in-out focus:outline-none ${
                                    activeNav === item 
                                        ? 'bg-black text-white' 
                                        : 'text-gray-600 hover:text-black hover:bg-gray-100'
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
};
