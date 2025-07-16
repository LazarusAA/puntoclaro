'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { AnimatedBackground } from '~/components/ui/animated-background'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { FcGoogle } from "react-icons/fc";
import { createClient } from '~/lib/supabase/client'
import { logAuthError } from '~/lib/secure-logger'

/**
 * Login form component with email/password and Google OAuth options
 */
const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err) {
      setError('Error al iniciar sesión con Google. Intenta de nuevo.')
      logAuthError(err, 'google_login')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos.')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      
      if (error) {
        // Log the actual error for debugging
        console.error('Supabase login error:', error)
        logAuthError(error, 'email_login', email)
        
        // Handle specific Supabase auth errors with user-friendly Spanish messages
        const errorMessage = error.message.toLowerCase()
        
        if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid credentials')) {
          setError('Email o contraseña incorrectos.')
        } else if (errorMessage.includes('email not confirmed')) {
          setError('Por favor, confirma tu email antes de iniciar sesión.')
        } else if (errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
          setError('Demasiados intentos. Espera un momento antes de intentar de nuevo.')
        } else if (errorMessage.includes('user not found')) {
          setError('No existe una cuenta con este email. ¿Quieres registrarte?')
        } else if (errorMessage.includes('email address') && errorMessage.includes('invalid')) {
          setError('El formato del email no es válido.')
        } else {
          setError('Error al iniciar sesión. Verifica tus credenciales.')
        }
        return
      }
      
      // Success - auth provider will handle the state update
      // No need to do anything here, the modal will close automatically
      
    } catch (err) {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
      logAuthError(err, 'email_login', email)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleEmailLogin} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email-login">Email</Label>
        <Input 
          id="email-login" 
          type="email" 
          placeholder="tu@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-login">Contraseña</Label>
        <Input 
          id="password-login" 
          type="password" 
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required 
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            O continúa con
          </span>
        </div>
      </div>
      <Button 
        variant="outline" 
        className="w-full" 
        type="button" 
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <FcGoogle className="mr-2 h-4 w-4" />
        {isLoading ? 'Conectando...' : 'Google'}
      </Button>
    </form>
  )
}

/**
 * Signup form component with email/password and Google OAuth options
 */
const SignupForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const supabase = createClient()

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err) {
      setError('Error al registrarte con Google. Intenta de nuevo.')
      logAuthError(err, 'google_signup')
    } finally {
      setIsLoading(false)
    }
  }
  
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.'
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'La contraseña debe contener al menos una mayúscula, una minúscula y un número.'
    }
    return null
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos.')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Por favor, ingresa un email válido.')
      return
    }

    // Validate password strength
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      
      if (error) {
        // Log the actual error for debugging
        console.error('Supabase signup error:', error)
        logAuthError(error, 'email_signup', email)
        
        // Handle specific Supabase auth errors with user-friendly Spanish messages
        const errorMessage = error.message.toLowerCase()
        
        if (errorMessage.includes('user already registered')) {
          setError('Este email ya está registrado. Intenta iniciar sesión.')
        } else if (errorMessage.includes('password should be at least')) {
          setError('La contraseña debe tener al menos 6 caracteres.')
        } else if (errorMessage.includes('unable to validate email') || errorMessage.includes('invalid format')) {
          setError('El formato del email no es válido.')
        } else if (errorMessage.includes('email address') && errorMessage.includes('invalid')) {
          setError('El email ingresado no es válido. Por favor, usa un email real.')
        } else if (errorMessage.includes('signup is disabled')) {
          setError('El registro está temporalmente deshabilitado.')
        } else if (errorMessage.includes('signups not allowed')) {
          setError('El registro no está habilitado en este momento.')
        } else if (errorMessage.includes('email rate limit exceeded')) {
          setError('Demasiados emails enviados. Espera unos minutos antes de intentar de nuevo.')
        } else if (errorMessage.includes('weak password')) {
          setError('La contraseña es muy débil. Usa una contraseña más segura.')
        } else if (errorMessage.includes('email not confirmed')) {
          setError('Por favor, confirma tu email antes de continuar.')
        } else {
          setError('Error al crear la cuenta. Verifica tus datos e intenta de nuevo.')
        }
        return
      }
      
      // Success - user is automatically logged in
      // The AuthProvider will detect the auth state change and close the modal
      // No need to show a success message since the user is now logged in
      
    } catch (err) {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
      logAuthError(err, 'email_signup', email)
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <form onSubmit={handleEmailSignup} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email-signup">Email</Label>
        <Input 
          id="email-signup" 
          type="email" 
          placeholder="tu@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-signup">Contraseña</Label>
        <Input 
          id="password-signup" 
          type="password" 
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required 
        />
        <p className="text-xs text-gray-500">
          Mínimo 8 caracteres con al menos una mayúscula, una minúscula y un número.
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </Button>
       <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            O regístrate con
          </span>
        </div>
      </div>
      <Button 
        variant="outline" 
        className="w-full" 
        type="button" 
        onClick={handleGoogleSignup}
        disabled={isLoading}
      >
        <FcGoogle className="mr-2 h-4 w-4" />
        {isLoading ? 'Conectando...' : 'Google'}
      </Button>
    </form>
  )
}

interface AuthModalProps {
  /** Which tab should be active by default */
  defaultTab?: 'login' | 'signup'
  /** Custom trigger element (use trigger OR children, not both) */
  trigger?: React.ReactNode
  /** Custom trigger element (use trigger OR children, not both) */
  children?: React.ReactNode
}

/**
 * Unified authentication modal with login and signup tabs
 * 
 * @param defaultTab - Which tab to show initially ('login' | 'signup')
 * @param trigger - Custom trigger element to open the modal
 * @param children - Alternative way to pass custom trigger element
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <AuthModal />
 * 
 * // Open to signup tab
 * <AuthModal defaultTab="signup" />
 * 
 * // Custom trigger
 * <AuthModal trigger={<Button>Custom Login</Button>} />
 * ```
 */
export function AuthModal({ 
  defaultTab = 'login', 
  trigger,
  children 
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab)

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || children || (
          <Button variant="outline">Iniciar Sesión / Registrarse</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Bienvenido a Umbral</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Tu camino hacia la confianza empieza aquí.
          </DialogDescription>
        </DialogHeader>
        
        <div className="w-full">
          <div className="rounded-lg bg-gray-200 p-1 mb-6 dark:bg-zinc-800 flex">
            <AnimatedBackground
              defaultValue={defaultTab}
              className="rounded-md bg-white shadow-sm dark:bg-zinc-700"
              transition={{
                ease: 'easeInOut',
                duration: 0.2,
              }}
              onValueChange={(value) => {
                const validTab = value === 'login' || value === 'signup' ? value : 'login'
                setActiveTab(validTab)
              }}
            >
              {[
                { id: 'login', label: 'Iniciar Sesión' },
                { id: 'signup', label: 'Registrarse' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  data-id={tab.id}
                  type="button"
                  className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 transition-transform active:scale-[0.98] dark:text-gray-200 min-w-0"
                >
                  {tab.label}
                </button>
              ))}
            </AnimatedBackground>
          </div>

          <div className="pt-2">
            {activeTab === 'login' && <LoginForm />}
            {activeTab === 'signup' && <SignupForm />}
          </div>
        </div>
        
      </DialogContent>
    </Dialog>
  )
}

/**
 * Pre-configured button that opens the auth modal with the login tab active
 * 
 * @example
 * ```tsx
 * <LoginButton variant="outline" size="sm">Login</LoginButton>
 * ```
 */
export function LoginButton({ 
  variant = "outline", 
  size = "sm", 
  className = "",
  children = "Login"
}: {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}) {
  return (
    <AuthModal defaultTab="login">
      <Button variant={variant} size={size} className={`font-medium ${className}`}>
        {children}
      </Button>
    </AuthModal>
  )
}

/**
 * Pre-configured button that opens the auth modal with the signup tab active
 * 
 * @example
 * ```tsx
 * <SignupButton variant="default" size="sm">Sign up</SignupButton>
 * ```
 */
export function SignupButton({ 
  variant = "default", 
  size = "sm", 
  className = "",
  children = "Sign up"
}: {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}) {
  return (
    <AuthModal defaultTab="signup">
      <Button variant={variant} size={size} className={`font-medium ${className}`}>
        {children}
      </Button>
    </AuthModal>
  )
} 