'use client' // This page will have client-side interactions (e.g., modals)

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '~/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { useSafeUserData } from '~/lib/user-utils'
import { ZonaRojaCard } from '~/components/shared/zona-roja-card'
import { PaywallModal } from '~/components/shared/paywall-modal'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [zonasRojas, setZonasRojas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPaywallOpen, setIsPaywallOpen] = useState(false)
  
  // Get safe user data with validation
  const safeUserData = useSafeUserData(user)

  useEffect(() => {
    const getSessionData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // This should ideally redirect to login, but for now, we'll just set an error.
        setError('No se pudo encontrar al usuario. Por favor, inicia sesión de nuevo.')
        setIsLoading(false)
        return
      }
      setUser(user)

      // Fetch the most recent completed diagnostic session for this user
      const { data, error } = await supabase
        .from('diagnostic_sessions')
        .select('result_summary')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error || !data) {
        setError('No pudimos encontrar los resultados de tu diagnóstico.')
        console.error('Error fetching diagnostic session:', error)
        setIsLoading(false)
        return
      }

      // The result_summary from the DB is the array of Zonas Rojas
      if (data.result_summary && Array.isArray(data.result_summary)) {
        // Map topic titles to topic IDs
        const topicTitles = data.result_summary.map((zona: any) => zona.title).filter(Boolean)
        
        // Fetch topic IDs for the zona roja titles
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .select('id, name')
          .in('name', topicTitles)
        
        if (topicsError) {
          console.error('Error fetching topic IDs:', topicsError)
        }
        
        // Create a map of topic names to IDs
        const topicNameToId = new Map(
          topicsData?.map(topic => [topic.name, topic.id]) || []
        )
        
        // Add isLocked property and topic IDs to the results
        const resultsWithLockStateAndIds = data.result_summary.map((zona: any, index: number) => ({
          ...(zona || {}),
          isLocked: index > 0, // The first one is unlocked, the rest are locked
          topicId: topicNameToId.get(zona.title) || null,
        }))
        
        setZonasRojas(resultsWithLockStateAndIds)
      }
      setIsLoading(false)
    }

    getSessionData()
  }, [supabase])

  const handleCardClick = (isLocked: boolean, title: string, topicId?: string) => {
    if (isLocked) {
      setIsPaywallOpen(true);
    } else if (topicId) {
      // Navigate to the learning page with the topic ID
      router.push(`/learn/${topicId}`);
    } else {
      // Fallback if no topic ID is found
      setError(`No se pudo encontrar el ID del tema para "${title}". Por favor, contacta soporte.`);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <main className="flex-grow bg-slate-50/50">
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:px-8">
          <header className="mb-10 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              ¡Pura vida, {safeUserData?.fullName || 'Estudiante'}!
            </h1>
            <p className="text-lg text-slate-600 mt-2 max-w-2xl">
              Tu diagnóstico está listo. Este es tu plan de ataque. Enfócate en estas 3
              áreas para ver el mayor progreso.
            </p>
          </header>
          
          {isLoading ? (
            <p>Cargando tu plan de ataque...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {zonasRojas.map((zona) => (
                <ZonaRojaCard
                  key={zona.title}
                  title={zona.title}
                  description={zona.description}
                  isLocked={zona.isLocked}
                  onClick={() => handleCardClick(zona.isLocked, zona.title, zona.topicId)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />
    </div>
  )
}
