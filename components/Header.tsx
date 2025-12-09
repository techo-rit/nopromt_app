import React, { useState } from 'react';
import { RemixLogoIcon } from './Icons';
import type { User } from '../types';

type NavCategory = 'Try on' | 'Creators';

interface HeaderProps {
    activeNav: NavCategory;
    onNavClick: (category: NavCategory) => void;
    user: User | null;
    onSignIn: () => void;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    activeNav,
    onNavClick,
    user,
    onSignIn,
    onLogout,
}) => {
    const navItems: NavCategory[] = ['Creators', 'Try on'];
    const [showUserMenu, setShowUserMenu] = useState(false);

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

                {/* Right side - Auth Button or User Menu */}
                <div className="flex items-center gap-4">
                    {!user ? (
                        <button
                            onClick={onSignIn}
                            className="px-6 py-2 bg-black text-white font-medium rounded-full hover:bg-gray-900 transition-all duration-200 focus:outline-none"
                        >
                            Sign In
                        </button>
                    ) : (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-all focus:outline-none"
                            >
                                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-medium text-sm">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{user?.name?.split(' ')[0] || 'User'}</span>
                            </button>


                            {/* User Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-black">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
