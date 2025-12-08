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

type Page = 'home' | 'stack' | 'template';
type NavCategory = 'Try on' | 'Creators';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeNav, setActiveNav] = useState<NavCategory>('Creators');
  const [selectedStack, setSelectedStack] = useState<Stack | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const trendingTemplates = TRENDING_TEMPLATE_IDS.map(id => TEMPLATES.find(t => t.id === id)).filter((t): t is Template => !!t);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleSelectStack = useCallback((stack: Stack) => {
    setSelectedStack(stack);
    setCurrentPage('stack');
  }, []);

  const handleSelectTemplate = useCallback((template: Template) => {
    const stackForTemplate = STACKS.find(s => s.id === template.stackId);
    if (stackForTemplate) {
        setSelectedStack(stackForTemplate);
        setSelectedTemplate(template);
        setCurrentPage('template');
    } else {
        console.error(`Could not find stack with id ${template.stackId} for template ${template.name}`);
    }
  }, []);
  
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
    setActiveNav(category);
    setCurrentPage('home');
    setSelectedStack(null);
    setSelectedTemplate(null);
  }, []);

  // Authentication handlers
  const handleSignUp = async (email: string, password: string, name: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const newUser = await authService.signUp(email, password, name);
      setUser(newUser);
      setShowAuthModal(false);
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
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Google sign in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  const renderContent = () => {
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

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#0071e3] selection:text-white">
      <Header
        activeNav={activeNav}
        onNavClick={handleNavClick}
        user={user}
        onSignIn={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />
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
