'use client'

import { useAuth } from '~/components/providers/auth-provider'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { AuthModal } from '~/components/shared/auth-modal'

export function SessionExpiredModal() {
  const { sessionExpired, refreshSession } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshSession()
    } catch (error) {
      // If refresh fails, show auth modal
      setShowAuthModal(true)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <>
      <Dialog open={sessionExpired} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <DialogTitle className="text-xl">Sesión Expirada</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Tu sesión ha expirado por seguridad. Por favor, inicia sesión de nuevo para continuar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              variant="outline"
              className="w-full"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Intentando renovar...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Intentar Renovar Sesión
                </>
              )}
            </Button>
            
            <AuthModal defaultTab="login">
              <Button className="w-full">
                Iniciar Sesión de Nuevo
              </Button>
            </AuthModal>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> Para evitar esto en el futuro, mantén la pestaña activa mientras usas la aplicación.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Fallback auth modal if refresh fails */}
      {showAuthModal && (
        <AuthModal defaultTab="login">
          <div /> {/* Hidden trigger */}
        </AuthModal>
      )}
    </>
  )
} 