import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LearningTabs } from '~/components/shared/learning-tabs'
import type { LearningModule } from '~/types/learning'

// This placeholder data will be replaced by a call to our backend using the topicId.
const learningModuleData: LearningModule = {
  title: 'Razonamiento Deductivo',
  explanation: {
    validation: 'Este tipo de razonamiento parece complicado, pero en realidad es algo que usas todos los días. Vamos a ponerle nombre.',
    analogy: 'Imagina que sabes una regla general: "Todos los buses de Sabana-Estadio pasan por La Sabana". Si ves el bus de Sabana-Estadio, puedes deducir con 100% de certeza que pasará por La Sabana. Eso es razonamiento deductivo.',
    core_concept: 'Consiste en partir de una regla general (una premisa) para llegar a una conclusión específica y lógicamente inevitable. Si la regla es verdadera, la conclusión también lo es.'
  },
  machote: {
    title: 'El Machote para el Razonamiento Deductivo',
    steps: [
      'Paso 1: Identifica la regla general o "premisa mayor". ¿Cuál es el hecho universal que te dan?',
      'Paso 2: Identifica el caso específico o "premisa menor". ¿Qué información particular te están dando?',
      'Paso 3: Aplica la regla general al caso específico para encontrar la única conclusión lógica.',
    ],
    common_mistakes: [
      '¡OJO! No confundir con el razonamiento inductivo, que es sacar una regla general a partir de casos específicos (y que no siempre es 100% seguro).'
    ]
  }
}

// The page receives `params` which contains the dynamic parts of the URL.
export default async function LearningPage({ params }: { params: Promise<{ topicId: string }> }) {
  // In a real app, you would use `params.topicId` to fetch this data.
  
  // For now, we'll use the topicId for future integration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { topicId } = await params

    return (
    <div className="bg-slate-50/50">
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:py-16 lg:px-8">
        {/* Navigation back to dashboard */}
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a mi plan de ataque
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{learningModuleData.title}</h1>
          <p className="text-lg text-slate-600 mt-2">Tu micro-dosis de estudio está lista. Concéntrate en una sección a la vez.</p>
        </header>

        <LearningTabs learningData={learningModuleData} />
      </div>
    </div>
  )
} 