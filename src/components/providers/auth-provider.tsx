'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '~/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { logAuthError } from '~/lib/secure-logger'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  sessionExpired: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    let refreshTimer: NodeJS.Timeout | null = null

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          if (error.message.includes('refresh_token_not_found') || 
              error.message.includes('invalid_refresh_token')) {
            setSessionExpired(true)
            setUser(null)
          } else {
            throw error
          }
        } else {
          setUser(session?.user ?? null)
          setSessionExpired(false)
          
          // Set up automatic token refresh if we have a session
          if (session?.expires_at) {
            setupTokenRefresh(session.expires_at)
          }
        }
      } catch (error) {
        logAuthError(error, 'get_initial_session')
        setUser(null)
        setSessionExpired(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Setup automatic token refresh
    const setupTokenRefresh = (expiresAt: number) => {
      // Clear existing timer
      if (refreshTimer) {
        clearTimeout(refreshTimer)
      }
      
      // Calculate when to refresh (5 minutes before expiry)
      const refreshTime = (expiresAt * 1000) - Date.now() - (5 * 60 * 1000)
      
      if (refreshTime > 0) {
        refreshTimer = setTimeout(async () => {
          await refreshSession()
        }, refreshTime)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
        
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setSessionExpired(false)
        }
        
        if (event === 'TOKEN_REFRESHED' && session?.expires_at) {
          setupTokenRefresh(session.expires_at)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      if (refreshTimer) {
        clearTimeout(refreshTimer)
      }
    }
  }, [supabase.auth])

  const signOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      setSessionExpired(false)
    } catch (error) {
      logAuthError(error, 'sign_out')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        if (error.message.includes('refresh_token_not_found') || 
            error.message.includes('invalid_refresh_token')) {
          setSessionExpired(true)
          setUser(null)
        } else {
          logAuthError(error, 'refresh_session')
        }
      } else {
        setUser(session?.user ?? null)
        setSessionExpired(false)
      }
    } catch (error) {
      logAuthError(error, 'refresh_session')
      setSessionExpired(true)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      sessionExpired, 
      signOut, 
      refreshSession 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 