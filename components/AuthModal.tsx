import React, { useState } from 'react';
import { CloseIcon, GoogleIcon } from './Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: (email: string, password: string, name: string) => Promise<void>;
  onLogin: (email: string, password: string) => Promise<void>;
  onGoogleAuth: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

type AuthTab = 'login' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSignUp,
  onLogin,
  onGoogleAuth,
  isLoading,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    if (activeTab === 'signup') {
      if (!name) {
        setLocalError('Please enter your name');
        return;
      }
      await onSignUp(email, password, name);
    } else {
      await onLogin(email, password);
    }

    // Reset form on success
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    setLocalError(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  const displayError = localError || error;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="relative px-8 py-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black">
              {activeTab === 'login' ? 'Welcome Back' : 'Join nopromt.ai'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              <CloseIcon width={24} height={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-8 pt-6">
            <button
              onClick={() => handleTabChange('login')}
              className={`pb-4 px-4 -mx-4 text-base font-medium transition-colors relative ${
                activeTab === 'login'
                  ? 'text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Log In
              {activeTab === 'login' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full" />
              )}
            </button>
            <button
              onClick={() => handleTabChange('signup')}
              className={`pb-4 px-4 -mx-4 text-base font-medium transition-colors relative ${
                activeTab === 'signup'
                  ? 'text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
              {activeTab === 'signup' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Error Message */}
            {displayError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{displayError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Loading...' : activeTab === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mt-8 mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={onGoogleAuth}
              disabled={isLoading}
              type="button"
              className="w-full py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <GoogleIcon width={20} height={20} />
              Continue with Google
            </button>

            {/* Terms */}
            <p className="mt-6 text-xs text-gray-500 text-center">
              By continuing, you agree to our{' '}
              <button className="text-black hover:underline font-medium">
                Terms of Service
              </button>
              {' '}and{' '}
              <button className="text-black hover:underline font-medium">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
