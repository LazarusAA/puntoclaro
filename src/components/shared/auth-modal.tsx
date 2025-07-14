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

/**
 * Login form component with email/password and Google OAuth options
 */
const LoginForm = () => {
  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth login with Supabase
    console.log('Initiating Google Login...');
  };
  
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email/password login with Supabase
    console.log('Handling Email Login...');
  };

  return (
    <form onSubmit={handleEmailLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email-login">Email</Label>
        <Input id="email-login" type="email" placeholder="tu@email.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-login">Contraseña</Label>
        <Input id="password-login" type="password" required />
      </div>
      <Button type="submit" className="w-full">Iniciar Sesión</Button>
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
      <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin}>
        <FcGoogle className="mr-2 h-4 w-4" />
        Google
      </Button>
    </form>
  )
}

/**
 * Signup form component with email/password and Google OAuth options
 */
const SignupForm = () => {
  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth signup with Supabase
    console.log('Initiating Google Signup...');
  };
  
  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email/password signup with Supabase
    console.log('Handling Email Signup...');
  };

  return (
    <form onSubmit={handleEmailSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email-signup">Email</Label>
        <Input id="email-signup" type="email" placeholder="tu@email.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-signup">Contraseña</Label>
        <Input id="password-signup" type="password" required />
      </div>
      <Button type="submit" className="w-full">Crear Cuenta</Button>
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
      <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignup}>
        <FcGoogle className="mr-2 h-4 w-4" />
        Google
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