import { ExternalLink, Compass, Clock, Brain } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Feature43 } from "~/components/shared/problem-section";
import { SolutionSection } from "~/components/shared/solution-section";
import { Testimonial10 } from "~/components/shared/testimonial-section";
import { Cta10 } from "~/components/shared/call-to-action";

// Custom Hero Section based on Hero12
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden bg-gradient-to-b from-background to-muted/20 pt-20 md:pt-32">
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <img
          alt="background"
          src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/square-alt-grid.svg"
          className="h-full w-full object-cover [mask-image:radial-gradient(80%_80%_at_center,white,transparent)]"
        />
      </div>
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <div className="rounded-xl bg-background/80 p-2 shadow-lg backdrop-blur-sm mb-8">
              <img
                src="/logo.svg"
                alt="PuntoClaro Logo"
                className="h-24 w-24 md:h-32 md:w-32 object-contain"
              />
            </div>
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-pretty md:text-5xl lg:text-6xl">
              ¿La <span className="text-primary">jupa nublada</span> por el examen de admisión?
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Deja de estudiar a ciegas. Descubre gratis en 90 segundos cuáles son las 3 áreas que de verdad necesitas mejorar para asegurar tu futuro con la PAA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="text-lg px-8 py-6 shadow-lg transition-all hover:shadow-xl hover:scale-105" size="lg">
                Empezar mi Diagnóstico GRATIS
              </Button>
              <Button variant="outline" className="group text-lg px-8 py-6">
                Ver cómo funciona{" "}
                <ExternalLink className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Problem Section */}
      <Feature43 
        heading="Si te sientes así, estás en el lugar correcto"
        reasons={[
          {
            title: "Estudias sin Rumbo",
            description: "Pasas horas repasando, pero no sabes si estás enfocándote en lo que realmente te dará más puntos en el examen.",
            icon: <Compass className="size-6" />
          },
          {
            title: "La Lógica te Abruma", 
            description: "Sientes que la 'lógica matemática' del TEC y la UCR es un juego de adivinanzas que el cole nunca te enseñó a jugar.",
            icon: <Brain className="size-6" />
          },
          {
            title: "Ansiedad por el Tiempo",
            description: "Te preocupa quedarte pegado en una pregunta y que el tiempo no te alcance para terminar la prueba con calma.",
            icon: <Clock className="size-6" />
          }
        ]}
      />

      {/* Solution Section */}
      <SolutionSection />

      {/* Testimonial Section */}
      <Testimonial10 
        quote="Esos exámenes son más de aptitud que de conocimiento... la forma de prepararse es hacer mucha, pero mucha práctica, porque un componente grande es tu capacidad de manejar tu propio tiempo y tu estrés."
        author={{
          name: "Alvaro Lazarus",
          role: "Founder & CEO",
          avatar: {
            src: "/testimonial.svg",
            alt: "Estudiante"
          }
        }}
      />

      {/* Final CTA Section */}
      <Cta10 
        heading="Tu futuro empieza hoy"
        description="Deja la ansiedad. Toma el control. Descubre tus Zonas Rojas."
        buttons={{
          primary: {
            text: "Empezar mi Diagnóstico GRATIS",
            url: "#diagnostico"
          }
        }}
      />
    </div>
  );
}
