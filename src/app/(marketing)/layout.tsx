import { Navbar1 } from "~/components/layouts/main-nav";
import { Footer7 } from "~/components/layouts/site-footer";

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
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
          alt: "PuntoClaro Logo",
          title: "PuntoClaro",
        }}
        menu={[
          { title: "Inicio", url: "/" },
          { title: "Diagnóstico", url: "#diagnostico" },
          { title: "¿Cómo funciona?", url: "#como-funciona" },
          { title: "Testimonios", url: "#testimonios" },
        ]}
        auth={{
          login: { title: "Iniciar Sesión", url: "/login" },
          signup: { title: "Registrarse", url: "/signup" },
        }}
      />
      <main className="flex-1">{children}</main>
      <Footer7 
        logo={{
          url: "/",
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
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
