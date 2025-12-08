import { supabaseAuthService } from './supabaseAuthService'
import type { User } from '../types'

/**
 * Main Authentication Service
 * This wraps Supabase auth and provides consistent interface
 * Used by App.tsx and AuthModal.tsx
 */

export const authService = {
  async signUp(email: string, password: string, name: string): Promise<User> {
    return supabaseAuthService.signUp(email, password, name)
  },

  async login(email: string, password: string): Promise<User> {
    return supabaseAuthService.login(email, password)
  },

  async signInWithGoogle(): Promise<User> {
    return supabaseAuthService.signInWithGoogle()
  },

  async getCurrentUser(): Promise<User | null> {
    return supabaseAuthService.getCurrentUser()
  },

  async logout(): Promise<void> {
    return supabaseAuthService.logout()
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabaseAuthService.onAuthStateChange(callback)
  },
}
