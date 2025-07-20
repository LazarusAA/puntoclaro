'use client' // This page will have client-side interactions (e.g., modals)

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '~/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { useSafeUserData } from '~/lib/user-utils'
import { ZonaRojaCard } from '~/components/shared/zona-roja-card'
import { PaywallModal } from '~/components/shared/paywall-modal'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { RefreshCw, AlertTriangle, BookOpen } from 'lucide-react'

// Type for Zona Roja data
type ZonaRoja = {
  title: string
  description: string
  isLocked: boolean
  topicId: string | null
}

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [zonasRojas, setZonasRojas] = useState<ZonaRoja[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPaywallOpen, setIsPaywallOpen] = useState(false)
  const [loadingZonaRoja, setLoadingZonaRoja] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  // Ref to track if we've already attempted to fetch data
  const hasAttemptedFetch = useRef(false)
  
  // Get safe user data with validation
  const safeUserData = useSafeUserData(user)

  // Defensive check for safeUserData
  const displayName = safeUserData?.fullName || 'Estudiante'

  const fetchZonasRojas = useCallback(async (userToUse: User): Promise<void> => {
    // Prevent duplicate fetch attempts
    if (hasAttemptedFetch.current && !retryCount) {
        return
      }
    
    try {
      setIsLoading(true)
      setError(null)
      hasAttemptedFetch.current = true
      
      console.log('Fetching diagnostic session for user:', userToUse.id)

      // Fetch the most recent completed diagnostic session for this user
      const { data, error: sessionError } = await supabase
        .from('diagnostic_sessions')
        .select('result_summary, created_at')
        .eq('user_id', userToUse.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (sessionError) {
        console.error('Error fetching diagnostic session:', sessionError)
        
        // Check if it's a "no rows returned" error - this is not retryable
        if (sessionError.code === 'PGRST116') {
          setError('No se encontró un diagnóstico completado. Completa el diagnóstico primero para ver tu plan de ataque.')
        setIsLoading(false)
        return
      }

        // Network or database connectivity errors are retryable
        if (sessionError.code === 'PGRST301' || sessionError.code === 'PGRST302' || 
            sessionError.message.includes('network') || sessionError.message.includes('timeout')) {
          throw new Error(`Error de conexión: ${sessionError.message}`)
        }
        
        // Other database errors are not retryable
        throw new Error(`Error al cargar el diagnóstico: ${sessionError.message}`)
      }

      if (!data) {
        throw new Error('No se encontraron datos del diagnóstico')
      }

      console.log('Diagnostic session data:', data)

      // Validate result_summary structure
      console.log('result_summary type:', typeof data.result_summary)
      console.log('result_summary value:', data.result_summary)
      console.log('result_summary is null:', data.result_summary === null)
      console.log('result_summary is undefined:', data.result_summary === undefined)
      console.log('result_summary is array:', Array.isArray(data.result_summary))
      
      if (!data.result_summary) {
        console.error('result_summary is falsy:', data.result_summary)
        throw new Error('El diagnóstico no tiene resultados válidos')
      }

      if (!Array.isArray(data.result_summary)) {
        console.error('result_summary is not an array:', typeof data.result_summary, data.result_summary)
        throw new Error('Formato de resultados inválido')
      }

      // Extract and validate zona roja titles
      const topicTitles = data.result_summary
        .map((zona: unknown) => {
          if (zona && typeof zona === 'object' && 'title' in zona && typeof zona.title === 'string') {
            return zona.title
          }
          console.warn('Invalid zona roja format:', zona)
          return null
        })
        .filter((title): title is string => Boolean(title))

      if (topicTitles.length === 0) {
        throw new Error('No se encontraron temas válidos en el diagnóstico')
      }

      console.log('Topic titles found:', topicTitles)
        
        // Fetch topic IDs for the zona roja titles
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .select('id, name')
          .in('name', topicTitles)
        
        if (topicsError) {
          console.error('Error fetching topic IDs:', topicsError)
        // Don't throw here, we can still show the cards without topic IDs
        }
      
      console.log('Topics data:', topicsData)
        
        // Create a map of topic names to IDs
        const topicNameToId = new Map(
          topicsData?.map(topic => [topic.name, topic.id]) || []
        )
        
      // Build the zonas rojas with proper validation
      const resultsWithLockStateAndIds: ZonaRoja[] = data.result_summary
        .map((zona: unknown, index: number) => {
          if (zona && typeof zona === 'object' && 'title' in zona && 'description' in zona) {
            const title = zona.title as string
            const description = zona.description as string
            
            return {
              title,
              description,
          isLocked: index > 0, // The first one is unlocked, the rest are locked
              topicId: topicNameToId.get(title) || null,
            }
          }
          console.warn('Skipping invalid zona roja:', zona)
          return null
        })
        .filter((zona): zona is ZonaRoja => zona !== null)

      if (resultsWithLockStateAndIds.length === 0) {
        throw new Error('No se pudieron procesar los resultados del diagnóstico')
      }

      console.log('Processed zonas rojas:', resultsWithLockStateAndIds)
        setZonasRojas(resultsWithLockStateAndIds)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar el plan de ataque'
      console.error('Dashboard error:', err)
      
      // Determine if this error is retryable
      const isRetryable = errorMessage.includes('Error de conexión') || 
                         errorMessage.includes('network') || 
                         errorMessage.includes('timeout') ||
                         errorMessage.includes('Error desconocido')
      
      setError(errorMessage)
      
      // Reset retry count for non-retryable errors
      if (!isRetryable) {
        setRetryCount(0)
      }
    } finally {
      setIsLoading(false)
    }
  }, [supabase, retryCount])

  useEffect(() => {
    const getSessionData = async () => {
      try {
        console.log('🔍 Starting getSessionData...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        console.log('🔍 User data received:', { user: user?.id, error: userError })
        
        if (userError) {
          console.error('Error getting user:', userError)
          setError('Error al verificar la sesión del usuario')
          setIsLoading(false)
          return
        }
        
        if (!user) {
          console.log('🔍 No user found, setting error')
          setError('No se pudo encontrar al usuario. Por favor, inicia sesión de nuevo.')
          setIsLoading(false)
          return
        }
        
        console.log('🔍 Setting user state:', user.id)
        setUser(user)
        
        console.log('🔍 About to call fetchZonasRojas with user:', user.id)
        // Fetch zonas rojas after user is set
        await fetchZonasRojas(user)
        
      } catch (err) {
        console.error('Error in getSessionData:', err)
        setError('Error al cargar los datos del usuario')
        setIsLoading(false)
      }
    }

    console.log('🔍 useEffect triggered, calling getSessionData')
    getSessionData()
  }, [supabase, fetchZonasRojas])

  const handleRetry = async () => {
    if (!user) {
      setError('No se pudo encontrar al usuario. Por favor, inicia sesión de nuevo.')
      return
    }
    
    setRetryCount(prev => prev + 1)
    hasAttemptedFetch.current = false // Reset the flag to allow retry
    await fetchZonasRojas(user) // Pass user directly to fetchZonasRojas
  }

  const handleCardClick = async (isLocked: boolean, title: string, topicId?: string | null) => {
    if (isLocked) {
      setIsPaywallOpen(true)
    } else if (topicId) {
      // Set loading state for this specific zona roja
      setLoadingZonaRoja(title)
      
      try {
      // Navigate to the learning page with the topic ID
        router.push(`/learn/${topicId}`)
      } catch (err) {
        console.error('Navigation error:', err)
        // Reset loading state if navigation fails
        setLoadingZonaRoja(null)
        setError('Error al navegar al módulo de estudio.')
      }
    } else {
      // Fallback if no topic ID is found
      setError(`No se pudo encontrar el ID del tema para "${title}". Por favor, contacta soporte.`)
    }
  }

  const handleStartDiagnostic = () => {
    router.push('/diagnostic')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50">
        <main className="flex-grow bg-slate-50/50">
          <div className="container mx-auto px-4 py-12 sm:py-16 lg:px-8">
            <header className="mb-10 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                ¡Pura vida, {displayName}!
              </h1>
              <p className="text-lg text-slate-600 mt-2 max-w-2xl">
                Tu diagnóstico está listo. Este es tu plan de ataque. Enfócate en estas 3
                áreas para ver el mayor progreso.
              </p>
            </header>
            
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-600">Cargando tu plan de ataque...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error) {
    // Determine if this error is retryable
    const isRetryable = error.includes('Error de conexión') || 
                       error.includes('network') || 
                       error.includes('timeout') ||
                       error.includes('Error desconocido')
    
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50">
        <main className="flex-grow bg-slate-50/50">
          <div className="container mx-auto px-4 py-12 sm:py-16 lg:px-8">
            <header className="mb-10 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                ¡Pura vida, {displayName}!
              </h1>
              <p className="text-lg text-slate-600 mt-2 max-w-2xl">
                Tu diagnóstico está listo. Este es tu plan de ataque. Enfócate en estas 3
                áreas para ver el mayor progreso.
              </p>
            </header>
            
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl text-red-600">
                  {isRetryable ? 'Error de conexión' : 'Error al cargar el plan'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-slate-600">{error}</p>
                
                <div className="flex flex-col gap-2">
                  {isRetryable ? (
                    <Button onClick={handleRetry} disabled={retryCount >= 3}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reintentar ({3 - retryCount} intentos restantes)
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={handleStartDiagnostic}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Ir al Diagnóstico
                    </Button>
                  )}
                  
                  {error.includes('diagnóstico') && !isRetryable && (
                    <Button variant="outline" onClick={handleStartDiagnostic}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Ir al Diagnóstico
                    </Button>
                  )}
                </div>
                
                {isRetryable && retryCount >= 3 && (
                  <p className="text-sm text-slate-500">
                    Si el problema persiste, contacta soporte técnico.
                  </p>
                )}
                
                {!isRetryable && (
                  <p className="text-sm text-slate-500">
                    Este error no se puede resolver automáticamente. Completa el diagnóstico para continuar.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // No diagnostic session state
  if (!isLoading && zonasRojas.length === 0 && !error) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50">
        <main className="flex-grow bg-slate-50/50">
          <div className="container mx-auto px-4 py-12 sm:py-16 lg:px-8">
            <header className="mb-10 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                ¡Pura vida, {displayName}!
              </h1>
              <p className="text-lg text-slate-600 mt-2 max-w-2xl">
                Tu diagnóstico está listo. Este es tu plan de ataque. Enfócate en estas 3
                áreas para ver el mayor progreso.
              </p>
            </header>
            
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-blue-600">
                  ¡Completa tu primer diagnóstico!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-slate-600">
                  Para ver tu plan de ataque personalizado, necesitas completar el diagnóstico primero.
                </p>
                
                <Button onClick={handleStartDiagnostic} className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Comenzar Diagnóstico
                </Button>
                
                <p className="text-sm text-slate-500">
                  Solo toma 5 minutos y te dará un plan de estudio personalizado.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Success state
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <main className="flex-grow bg-slate-50/50">
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:px-8">
          <header className="mb-10 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              ¡Pura vida, {displayName}!
            </h1>
            <p className="text-lg text-slate-600 mt-2 max-w-2xl">
              Tu diagnóstico está listo. Este es tu plan de ataque. Enfócate en estas 3
              áreas para ver el mayor progreso.
            </p>
          </header>
          

          
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {zonasRojas.map((zona) => (
                <ZonaRojaCard
                  key={zona.title}
                  title={zona.title}
                  description={zona.description}
                  isLocked={zona.isLocked}
                isLoading={loadingZonaRoja === zona.title}
                onClick={() => handleCardClick(zona.isLocked, zona.title, zona.topicId ?? undefined)}
                />
              ))}
            </div>
        </div>
      </main>
      <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />
    </div>
  )
}
