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
      const { error: profileError } = await supab
