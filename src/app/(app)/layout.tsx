import { Navbar1 } from '~/components/layouts/main-nav'
import { Footer7 } from '~/components/layouts/site-footer'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar1 
        menu={[]} 
        logo={{
          url: "/",
          src: "/logo.svg",
          alt: "Umbral Logo",
          title: "Umbral"
        }}
        auth={{
          login: { title: "Iniciar sesión", url: "/login" },
          signup: { title: "Registrarse", url: "/signup" }
        }}      
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer7 />
    </div>
  )
}
