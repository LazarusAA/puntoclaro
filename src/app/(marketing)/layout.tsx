import { Navbar1 } from "~/components/layouts/main-nav";
import { Footer7 } from "~/components/layouts/site-footer";
import { ScrollProgress } from "~/components/magicui/scroll-progress";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar1 
        logo={{
          url: "/",
          src: "/logo.svg",
          alt: "PuntoClaro Logo",
          title: "PuntoClaro",
        }}
        menu={[]}
        // Uncomment below for simple navigation when needed:
        // menu={[
        //   { title: "Inicio", url: "/" },
        //   { title: "Diagnóstico", url: "#diagnostico" },
        //   { title: "¿Cómo funciona?", url: "#como-funciona" },
        //   { title: "Testimonios", url: "#testimonios" },
        // ]}
        // Uncomment below for dropdown menus when needed:
        // menu={[
        //   { title: "Inicio", url: "/" },
        //   {
        //     title: "Producto",
        //     url: "#",
        //     items: [
        //       { title: "Diagnóstico", description: "Evaluación gratuita", url: "#diagnostico" },
        //       { title: "Planes", description: "Opciones de estudio", url: "#planes" },
        //     ],
        //   },
        //   {
        //     title: "Recursos",
        //     url: "#",
        //     items: [
        //       { title: "Blog", description: "Consejos de estudio", url: "#blog" },
        //       { title: "Guías", description: "Material de apoyo", url: "#guias" },
        //     ],
        //   },
        //   { title: "Testimonios", url: "#testimonios" },
        // ]}
        auth={{
          login: { title: "Iniciar Sesión", url: "/login" },
          signup: { title: "Registrarse", url: "/signup" },
        }}
      />
      <main className="flex-1">{children}</main>
      <ScrollProgress />
      <Footer7 
        logo={{
          url: "/",
          src: "/logo.svg",
          alt: "PuntoClaro Logo",
          title: "PuntoClaro",
        }}
        description="La plataforma más efectiva para prepararte para la PAA y entrar a la universidad de tus sueños."
        sections={[
          {
            title: "Producto",
            links: [
              { name: "Diagnóstico Gratis", href: "#" },
              { name: "Planes", href: "#" },
              { name: "Características", href: "#" },
            ],
          },
          {
            title: "Recursos",
            links: [
              { name: "Blog", href: "#" },
              { name: "Guías de Estudio", href: "#" },
              { name: "Preguntas Frecuentes", href: "#" },
            ],
          },
          {
            title: "Soporte",
            links: [
              { name: "Ayuda", href: "#" },
              { name: "Contacto", href: "#" },
              { name: "Comunidad", href: "#" },
            ],
          },
        ]}
        copyright="© 2024 PuntoClaro. Todos los derechos reservados."
      />
    </div>
  );
}
