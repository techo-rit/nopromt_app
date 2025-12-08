// Just delegates to supabaseAuthService
import { supabaseAuthService } from './supabaseAuthService'

export const authService = {
  async signUp(email, password, name) {
    return supabaseAuthService.signUp(email, password, name)
  },

  async login(email, password) {
    return supabaseAuthService.login(email, password)
  },

  // ... same pattern for all methods
}
