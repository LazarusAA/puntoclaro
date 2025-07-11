import { DiagnosticQuiz } from '~/components/shared/diagnostic-quiz'
import { Navbar1 } from '~/components/layouts/main-nav'
import { Footer7 } from '~/components/layouts/site-footer'

export default function DiagnosticPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar1 
        menu={[]} 
        logo={{
          url: "/",
          src: "/logo.svg",
          alt: "Punto Claro Logo",
          title: "Punto Claro"
        }}
        auth={{
          login: { title: "Iniciar sesión", url: "/login" },
          signup: { title: "Registrarse", url: "/signup" }
        }}
      />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl h-[750px] flex items-center justify-center">
          <DiagnosticQuiz />
        </div>
      </main>

      <Footer7 />
    </div>
  )
} 