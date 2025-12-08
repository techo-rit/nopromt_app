import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { TrendingCarousel } from './components/TrendingCarousel';
import { StackGrid } from './components/StackGrid';
import { TemplateGrid } from './components/TemplateGrid';
import { TemplateExecution } from './components/TemplateExecution';
import { authService } from './services/authService';
import type { Stack, Template, User } from './types';
import { STACKS, TEMPLATES, TRENDING_TEMPLATE_IDS } from './constants';
import { ArrowLeftIcon } from './components/Icons';

type Page = 'home' | 'stack' | 'template' | 'login-required';
type NavCategory = 'Try on' | 'Creators';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login-required');
  const [activeNav, setActiveNav] = useState<NavCategory>('Creators');
  const [selectedStack, setSelectedStack] = useState<Stack | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const trendingTemplates = TRENDING_TEMPLATE_IDS.map(id => TEMPLATES.find(t => t.id === id)).filter((t): t is Template => !!t);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setCurrentPage('home');
    } else {
      setCurrentPage('login-required');
    }
    setIsInitializing(false);
  }, []);

  const handleSelectStack = useCallback((stack: Stack) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedStack(stack);
    setCurrentPage('stack');
  }, [user]);

  const handleSelectTemplate = useCallback((template: Template) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const stackForTemplate = STACKS.find(s => s.id === template.stackId);
    if (stackForTemplate) {
        setSelectedStack(stackForTemplate);
        setSelectedTemplate(template);
        setCurrentPage('template');
    } else {
        console.error(`Could not find stack with id ${template.stackId} for template ${template.name}`);
    }
  }, [user]);
  
  const handleBack = useCallback(() => {
    if (currentPage === 'template') {
      if (activeNav === 'Try on') {
        setCurrentPage('home');
        setSelectedStack(null);
        setSelectedTemplate(null);
      } else {
        setCurrentPage('stack');
        setSelectedTemplate(null);
      }
    } else if (currentPage === 'stack') {
      setCurrentPage('home');
      setSelectedStack(null);
    }
  }, [currentPage, activeNav]);
  
  const handleNavClick = useCallback((category: NavCategory) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setActiveNav(category);
    setCurrentPage('home');
    setSelectedStack(null);
    setSelectedTemplate(null);
  }, [user]);

  // Authentication handlers
  const handleSignUp = async (email: string, password: string, name: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const newUser = await authService.signUp(email, password, name);
      setUser(newUser);
      setShowAuthModal(false);
      setCurrentPage('home');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Sign up failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      setShowAuthModal(false);
      setCurrentPage('home');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const googleUser = await authService.signInWithGoogle();
      setUser(googleUser);
      setShowAuthModal(false);
      setCurrentPage('home');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Google sign in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setCurrentPage('login-required');
    setSelectedStack(null);
    setSelectedTemplate(null);
  };

  const renderLoginRequired = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Logo/Icon */}
        <div className="mb-8 inline-block p-6 bg-black rounded-full">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-black mb-4 leading-tight">
          Welcome to nopromt.ai
        </h1>

        {/* Subheading */}
        <p className="text-xl text-gray-600 mb-2">
          Create stunning AI-generated images
        </p>
        <p className="text-gray-500 mb-12">
          Sign in or create an account to start remixing your images with our AI tools
        </p>

        {/* Features */}
        <div className="mb-12 space-y-4 text-left">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-black text-white text-sm font-semibold">
                ✓
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black">AI-Powered Image Creation</h3>
              <p className="text-gray-600 text-sm">Transform your images with cutting-edge AI technology</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-black text-white text-sm font-semibold">
                ✓
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black">Multiple Creator Stacks</h3>
              <p className="text-gray-600 text-sm">Choose from dozens of creative filters and styles</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-black text-white text-sm font-semibold">
                ✓
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black">Virtual Try-On</h3>
              <p className="text-gray-600 text-sm">Test products and styles in real-time</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => setShowAuthModal(true)}
          className="w-full py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-all duration-200 mb-4"
        >
          Sign In or Create Account
        </button>

        {/* Secondary text */}
        <p className="text-sm text-gray-500">
          Secure authentication • Free to get started • No credit card required
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    // Show login required screen if not authenticated
    if (currentPage === 'login-required' || !user) {
      return renderLoginRequired();
    }

    switch (currentPage) {
      case 'template':
        return selectedTemplate && selectedStack && (
          <TemplateExecution template={selectedTemplate} stack={selectedStack} onBack={handleBack} />
        );
      case 'stack':
        return selectedStack && (
          <div className="w-full max-w-[1440px] mx-auto px-8 py-12">
            <button
              onClick={handleBack}
              aria-label="Go back to all stacks"
              className="flex items-center gap-2 text-[#0071e3] hover:text-[#0077ED] mb-8 transition-colors rounded-md focus:outline-none font-medium text-lg"
            >
              <ArrowLeftIcon />
              Back to Stacks
            </button>
            <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] font-bold tracking-tight text-black mb-4 leading-[1.1]">{selectedStack.name}</h1>
            <p className="text-gray-500 text-[clamp(1.3rem,4vw,1.5rem)] font-normal mb-12 leading-[1.4] max-w-2xl">Choose a template to start remixing your image.</p>
            <TemplateGrid
              templates={TEMPLATES.filter(t => t.stackId === selectedStack.id)}
              onSelectTemplate={handleSelectTemplate}
            />
          </div>
        );
      case 'home':
      default:
        if (activeNav === 'Try on') {
          const fititTemplates = TEMPLATES.filter(t => t.stackId === 'fitit');
          return (
            <div className="w-full max-w-[1440px] mx-auto px-8 py-12">
              <TemplateGrid 
                templates={fititTemplates} 
                onSelectTemplate={handleSelectTemplate}
              />
            </div>
          );
        }
        
        const creatorsStackIds = ['flex', 'aesthetics', 'sceneries', 'clothes', 'monuments', 'celebration', 'fitit', 'animation'];
        const stacksToShow = creatorsStackIds
          .map(id => STACKS.find(s => s.id === id))
          .filter((s): s is Stack => !!s);
          
        const pageTitle = 'Creator Stacks.';

        return (
          <>
            <TrendingCarousel templates={trendingTemplates} onSelectTemplate={handleSelectTemplate} />
            <div className="w-full max-w-[1440px] mx-auto px-8 py-8">
              <h2 className="text-[clamp(2.5rem,5vw,3.5rem)] font-bold tracking-tight leading-[1.1] text-[#1d1d1f] py-8 text-left border-t border-gray-100">{pageTitle}</h2>
              <StackGrid 
                stacks={stacksToShow} 
                onSelectStack={handleSelectStack}
              />
            </div>
          </>
        );
    }
  };

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#0071e3] selection:text-white">
      {user && (
        <Header
          activeNav={activeNav}
          onNavClick={handleNavClick}
          user={user}
          onSignIn={() => setShowAuthModal(true)}
          onLogout={handleLogout}
        />
      )}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setAuthError(null);
        }}
        onSignUp={handleSignUp}
        onLogin={handleLogin}
        onGoogleAuth={handleGoogleAuth}
        isLoading={authLoading}
        error={authError}
      />
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
