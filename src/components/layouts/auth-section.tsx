'use client'

import { useAuth } from '~/components/providers/auth-provider'
import { LoginButton, SignupButton } from '~/components/shared/auth-modal'
import { UserNav } from './user-nav'

interface AuthSectionProps {
  loginTitle: string
  signupTitle: string
  className?: string
  buttonProps?: {
    loginVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    loginSize?: "default" | "sm" | "lg" | "icon"
    signupSize?: "default" | "sm" | "lg" | "icon"
    loginClassName?: string
    signupClassName?: string
  }
}

export function AuthSection({ 
  loginTitle, 
  signupTitle, 
  className = "",
  buttonProps = {}
}: AuthSectionProps) {
  const { user, isLoading, signOut } = useAuth()

  // Show nothing while loading to prevent flashing
  if (isLoading) {
    return <div className={className}></div>
  }

  return (
    <div className={className}>
      {user ? (
        <UserNav user={user} onSignOut={signOut} />
      ) : (
        <>
          <LoginButton 
            variant={buttonProps.loginVariant || "outline"} 
            size={buttonProps.loginSize || "sm"}
            className={buttonProps.loginClassName || ""}
          >
            {loginTitle}
          </LoginButton>
          <SignupButton 
            size={buttonProps.signupSize || "sm"}
            className={buttonProps.signupClassName || ""}
          >
            {signupTitle}
          </SignupButton>
        </>
      )}
    </div>
  )
} 