import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LearningTabs } from '~/components/shared/learning-tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import type { LearningModule } from '~/types/learning'
import { headers } from 'next/headers'

// This function will fetch the data on the server before the page is rendered.
async function getLearningModule(topicId: string): Promise<{ data?: LearningModule; message?: string; error?: string }> {
  // Production-grade: Direct server-side API call
  const headersList = await headers();
  const cookie = headersList.get('cookie') ?? '';
  
  // Use absolute URL for same-domain server-side requests
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/learn/${topicId}`, {
      headers: { 
        cookie,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // We want fresh data for each user session
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.details || 'Failed to fetch learning module.');
    }
    
    // The API returns different structures for success, no-errors, or failure.
    if (data.code === 'NO_ERRORS_FOUND') {
      return { message: data.message };
    }

    if (data.learningModule) {
      return { data: data.learningModule };
    }

    return { error: 'Invalid response from server.' };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error("Fetch error in LearningPage:", errorMessage);
    return { error: errorMessage };
  }
}


export default async function LearningPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const { data: learningModule, message, error } = await getLearningModule(topicId);

  // Default title if the fetch fails or is in a different state
  const title = learningModule?.title || 'Módulo de Estudio';

  const shareMessage = `Este machote de "${title}" de Umbral me está salvando! Tienes que probarlo, el diagnóstico es gratis.`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://umbral.cr'

  const renderContent = () => {
    if (error) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Ocurrió un Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No pudimos cargar tu módulo de aprendizaje. Por favor, intenta de nuevo.</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </CardContent>
        </Card>
      );
    }

    if (message) {
      return (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>¡Felicidades!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{message}</p>
          </CardContent>
        </Card>
      );
    }

    if (learningModule) {
      return <LearningTabs learningData={learningModule} shareText={shareMessage} shareUrl={appUrl} />;
    }

    return <p>Cargando...</p>; // Fallback loading state
  }

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:py-16 lg:px-8">
        {/* Navigation back to dashboard */}
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a mi plan de ataque
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
          <p className="text-lg text-slate-600 mt-2">Tu micro-dosis de estudio está lista. Concéntrate en una sección a la vez.</p>
        </header>

        {renderContent()}
      </div>
    </div>
  );
} 