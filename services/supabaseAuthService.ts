import { supabase } from '../lib/supabase'
import type { User } from '../types'

/**
 * Supabase Authentication Service
 * Handles user signup, login, logout, and session management
 */

export const supabaseAuthService = {
  /**
   * Sign up new user with email and password
   */
  async signUp(email: string, password: string, fullName: string): Promise<User> {
    try {
      // Validate inputs
      if (!email || !password || !fullName) {
        throw new Error('All fields are required')
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Sign up failed')
      }

      // Create user profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: email,
            full_name: fullName,
          },
        ])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't throw - user is still created in auth
      }

      // Return user object
      const user: User = {
        id: authData.user.id,
        email: email,
        name: fullName,
        createdAt: new Date().toISOString(),
      }

      return user
    } catch (error) {
      throw error
    }
  },

  /**
   * Log in user with email and password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error('Login failed')
      }

      // Get full profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      const user: User = {
        id: data.user.id,
        email: data.user.email || email,
        name: profile?.full_name || email.split('@'),
        createdAt: data.user.created_at || new Date().toISOString(),
      }

      return user
    } catch (error) {
      throw error
    }
  },

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      // Note: After Google OAuth redirect, user will be logged in automatically
      // This function initiates the flow
      return {} as User
    } catch (error) {
      throw error
    }
  },

  /**
   * Get currently logged in user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        return null
      }

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: profile?.full_name || data.user.email?.split('@') || 'User',
        createdAt: data.user.created_at || new Date().toISOString(),
      }

      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  /**
   * Log out current user
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      throw error
    }
  },

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Get profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.full_name || session.user.email?.split('@') || 'User',
            createdAt: session.user.created_at || new Date().toISOString(),
          }
          callback(user)
        } else {
          callback(null)
        }
      }
    )

    return subscription
  },
}
