// Firebase Authentication Service
// This handles user sign up, login, and Google authentication

import { User } from '../types';

// Mock implementation - Replace with actual Firebase when ready
class AuthService {
  // For production, initialize Firebase like this:
  // import { initializeApp } from 'firebase/app';
  // import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

  private users: Map<string, { password: string; name: string }> = new Map();
  private currentUser: User | null = null;

  /**
   * Sign up a new user with email and password
   * In production, this will use Firebase Authentication
   */
  async signUp(email: string, password: string, name: string): Promise<User> {
    // Validate inputs
    if (!email || !password || !name) {
      throw new Error('Please provide email, password, and name');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user already exists
    if (this.users.has(email)) {
      throw new Error('User with this email already exists');
    }

    // Mock: Store user (in production, Firebase handles this)
    this.users.set(email, { password, name });

    // Create user object
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      createdAt: new Date(),
    };

    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  }

  /**
   * Log in a user with email and password
   * In production, this will use Firebase Authentication
   */
  async login(email: string, password: string): Promise<User> {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Please provide email and password');
    }

    // Mock: Check if user exists and password matches
    const storedUser = this.users.get(email);
    if (!storedUser || storedUser.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Create user object
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: storedUser.name,
      createdAt: new Date(),
    };

    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  }

  /**
   * Sign in with Google
   * In production, this will use Firebase Google Authentication
   */
  async signInWithGoogle(): Promise<User> {
    // Mock: Simulate Google sign-in
    // In production, this would use:
    // const provider = new GoogleAuthProvider();
    // const result = await signInWithPopup(auth, provider);
    // const user = result.user;

    const mockGoogleUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: `user${Math.random().toString(36).substr(2, 5)}@gmail.com`,
      name: 'Google User',
      createdAt: new Date(),
    };

    this.currentUser = mockGoogleUser;
    localStorage.setItem('user', JSON.stringify(mockGoogleUser));

    return mockGoogleUser;
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('user');
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Check if user exists in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      return this.currentUser;
    }

    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

// Create singleton instance
export const authService = new AuthService();

/**
 * PRODUCTION SETUP GUIDE:
 *
 * 1. Install Firebase:
 *    npm install firebase
 *
 * 2. Create a Firebase project at https://console.firebase.google.com
 *
 * 3. Get your Firebase config from Project Settings
 *
 * 4. Replace the AuthService class with:
 *
 * import { initializeApp } from 'firebase/app';
 * import {
 *   getAuth,
 *   createUserWithEmailAndPassword,
 *   signInWithEmailAndPassword,
 *   signInWithPopup,
 *   GoogleAuthProvider,
 *   signOut,
 * } from 'firebase/auth';
 *
 * const firebaseConfig = {
 *   apiKey: 'YOUR_API_KEY',
 *   authDomain: 'YOUR_AUTH_DOMAIN',
 *   projectId: 'YOUR_PROJECT_ID',
 *   storageBucket: 'YOUR_STORAGE_BUCKET',
 *   messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
 *   appId: 'YOUR_APP_ID',
 * };
 *
 * const app = initializeApp(firebaseConfig);
 * const auth = getAuth(app);
 * const googleProvider = new GoogleAuthProvider();
 *
 * class AuthService {
 *   async signUp(email: string, password: string, name: string): Promise<User> {
 *     const userCredential = await createUserWithEmailAndPassword(
 *       auth,
 *       email,
 *       password
 *     );
 *     return {
 *       id: userCredential.user.uid,
 *       email: userCredential.user.email || '',
 *       name,
 *       createdAt: new Date(),
 *     };
 *   }
 *
 *   async login(email: string, password: string): Promise<User> {
 *     const userCredential = await signInWithEmailAndPassword(
 *       auth,
 *       email,
 *       password
 *     );
 *     return {
 *       id: userCredential.user.uid,
 *       email: userCredential.user.email || '',
 *       name: userCredential.user.displayName || '',
 *       createdAt: new Date(),
 *     };
 *   }
 *
 *   async signInWithGoogle(): Promise<User> {
 *     const result = await signInWithPopup(auth, googleProvider);
 *     return {
 *       id: result.user.uid,
 *       email: result.user.email || '',
 *       name: result.user.displayName || '',
 *       createdAt: new Date(),
 *     };
 *   }
 *
 *   async logout(): Promise<void> {
 *     await signOut(auth);
 *   }
 *
 *   getCurrentUser(): User | null {
 *     const firebaseUser = auth.currentUser;
 *     if (!firebaseUser) return null;
 *     return {
 *       id: firebaseUser.uid,
 *       email: firebaseUser.email || '',
 *       name: firebaseUser.displayName || '',
 *       createdAt: new Date(),
 *     };
 *   }
 *
 *   isAuthenticated(): boolean {
 *     return auth.currentUser !== null;
 *   }
 * }
 */
