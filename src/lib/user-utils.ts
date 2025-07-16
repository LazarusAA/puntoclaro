/**
 * User utilities for safe metadata access and validation
 */

import type { User } from '@supabase/supabase-js'

/**
 * Strongly typed user metadata interface
 */
export interface UserMetadata {
  full_name?: string
  avatar_url?: string
  email_verified?: boolean
  provider?: string
  phone?: string
  picture?: string // Google uses 'picture' instead of 'avatar_url'
  name?: string // Some providers use 'name' instead of 'full_name'
  [key: string]: unknown
}

/**
 * Safe user metadata with guaranteed fallbacks
 */
export interface SafeUserData {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
  initials: string
  isEmailVerified: boolean
  provider: string
}

/**
 * Validates and sanitizes user metadata
 */
function validateUserMetadata(metadata: unknown): UserMetadata {
  if (!metadata || typeof metadata !== 'object') {
    return {}
  }
  
  const validated: UserMetadata = {}
  const meta = metadata as Record<string, unknown>
  
  // Validate full_name
  if (typeof meta.full_name === 'string' && meta.full_name.trim()) {
    validated.full_name = meta.full_name.trim()
  } else if (typeof meta.name === 'string' && meta.name.trim()) {
    // Fallback to 'name' field from some providers
    validated.full_name = meta.name.trim()
  }
  
  // Validate avatar_url
  if (typeof meta.avatar_url === 'string' && isValidUrl(meta.avatar_url)) {
    validated.avatar_url = meta.avatar_url
  } else if (typeof meta.picture === 'string' && isValidUrl(meta.picture)) {
    // Fallback to 'picture' field from Google
    validated.avatar_url = meta.picture
  }
  
  // Validate email_verified
  if (typeof meta.email_verified === 'boolean') {
    validated.email_verified = meta.email_verified
  }
  
  // Validate provider
  if (typeof meta.provider === 'string' && meta.provider.trim()) {
    validated.provider = meta.provider.trim()
  }
  
  // Validate phone
  if (typeof meta.phone === 'string' && meta.phone.trim()) {
    validated.phone = meta.phone.trim()
  }
  
  return validated
}

/**
 * Validates if a string is a valid URL
 */
function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Generates initials from a name or email
 */
function generateInitials(name: string | null, email: string): string {
  if (name && name.trim()) {
    const words = name.trim().split(/\s+/)
    if (words.length >= 2) {
      // Use first letter of first and last word
      return (words[0][0] + words[words.length - 1][0]).toUpperCase()
    } else {
      // Use first two letters of single word
      return name.trim().substring(0, 2).toUpperCase()
    }
  }
  
  // Fallback to email initials
  const emailPart = email.split('@')[0]
  return emailPart.substring(0, 2).toUpperCase()
}

/**
 * Creates safe user data with validated metadata and fallbacks
 */
export function createSafeUserData(user: User | null): SafeUserData | null {
  if (!user) return null
  
  // Validate required fields
  if (!user.id || !user.email) {
    console.warn('Invalid user object: missing id or email')
    return null
  }
  
  const metadata = validateUserMetadata(user.user_metadata)
  
  // Extract full name with fallbacks
  const fullName = metadata.full_name || 'Estudiante'
  
  // Extract avatar URL with validation
  const avatarUrl = metadata.avatar_url || null
  
  // Generate initials
  const initials = generateInitials(metadata.full_name || null, user.email)
  
  // Determine email verification status
  const isEmailVerified = user.email_confirmed_at != null || metadata.email_verified === true
  
  // Determine provider
  let provider = 'email'
  if (metadata.provider) {
    provider = metadata.provider
  } else if (user.app_metadata?.provider) {
    provider = user.app_metadata.provider
  } else if (user.identities && user.identities.length > 0) {
    provider = user.identities[0].provider || 'email'
  }
  
  return {
    id: user.id,
    email: user.email,
    fullName,
    avatarUrl,
    initials,
    isEmailVerified,
    provider
  }
}

/**
 * Hook-style function for safe user data access
 */
export function useSafeUserData(user: User | null) {
  return createSafeUserData(user)
}

/**
 * Validation functions for specific metadata fields
 */
export const userValidation = {
  /**
   * Validates display name
   */
  displayName: (name: unknown): string => {
    if (typeof name === 'string' && name.trim()) {
      // Remove potentially dangerous characters and limit length
      return name.trim().substring(0, 100).replace(/[<>\"'&]/g, '')
    }
    return 'Estudiante'
  },
  
  /**
   * Validates avatar URL
   */
  avatarUrl: (url: unknown): string | null => {
    if (typeof url === 'string' && isValidUrl(url)) {
      // Additional security: only allow common image domains in production
      if (process.env.NODE_ENV === 'production') {
        const allowedDomains = [
          'googleapis.com',
          'googleusercontent.com',
          'github.com',
          'githubusercontent.com',
          'gravatar.com',
          'supabase.co',
          'supabase.io'
        ]
        
        try {
          const urlObj = new URL(url)
          if (allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
            return url
          }
        } catch {
          return null
        }
        
        return null
      }
      
      return url
    }
    return null
  },
  
  /**
   * Validates email format
   */
  email: (email: unknown): string => {
    if (typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return email.toLowerCase().trim()
    }
    return 'usuario@ejemplo.com'
  }
} 