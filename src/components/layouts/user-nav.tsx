import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Button } from "~/components/ui/button";
import Link from "next/link";
import type { User } from '@supabase/supabase-js'
import { useSafeUserData } from '~/lib/user-utils'

export const UserNav = ({ user, onSignOut }: { user: User; onSignOut: () => void }) => {
  const safeUserData = useSafeUserData(user)
  
  // Defensive check - should never happen with proper auth provider
  if (!safeUserData) {
    return null
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={safeUserData.avatarUrl || undefined} 
              alt={safeUserData.fullName}
            />
            <AvatarFallback>{safeUserData.initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{safeUserData.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">{safeUserData.email}</p>
            {!safeUserData.isEmailVerified && (
              <p className="text-xs text-orange-600">⚠️ Email no verificado</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}; 