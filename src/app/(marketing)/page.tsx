import { ExternalLink, Compass, Clock, Brain, CheckCircle, Target, BookOpen } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Feature43 } from "~/components/shared/problem-section";
import { Testimonial10 } from "~/components/shared/testimonial-section";
import { Cta10 } from "~/components/shared/call-to-action";

// Custom Hero Section based on Hero12
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <img
          alt="background"
          src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/square-alt-grid.svg"
          className="h-full w-full object-cover [mask-image:radial-gradient(80%_80%_at_center,white,transparent)]"
        />
      </div>
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <div className="rounded-xl bg-background/80 p-6 shadow-lg backdrop-blur-sm mb-8">
              <img
                src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg"
                alt="PuntoClaro Logo"
                className="h-16 w-16"
              />
            </div>
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-pretty md:text-5xl lg:text-6xl">
              ¿La <span className="text-primary">jupa nublada</span> por el examen de admisión?
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Deja de estudiar a ciegas. Descubre gratis en 90 segundos cuáles son las 3 áreas que de verdad necesitas mejorar para la PAA.
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

// Custom Solution Section
const SolutionSection = () => {
  const steps = [
    {
      number: "1",
      title: "Responde 10 preguntas.",
      description: "Nuestro 'Lightning Diagnostic' analiza tus respuestas para encontrar tu patrón de errores, no solo si la tuviste buena o mala.",
      icon: <Target className="size-8 text-primary" />
    },
    {
      number: "2", 
      title: "Recibe tus 3 'Zonas Rojas'.",
      description: "Te mostramos las 3 áreas exactas donde cada minuto de estudio te dará el máximo resultado. Sin distracciones. Sin materia de relleno.",
      icon: <CheckCircle className="size-8 text-primary" />
    },
    {
      number: "3",
      title: "Domina un tema, GRATIS.",
      description: "Te damos una 'Micro-Dosis de Estudio' y un 'Machote' en PDF para que domines tu primera Zona Roja y veas lo fácil que puede ser.",
      icon: <BookOpen className="size-8 text-primary" />
    }
  ];

  return (
    <section className="w-full py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Te damos un plan de ataque en 3 simples pasos.
          </h2>
        </div>
        
        <div className="grid gap-8 md:gap-12 sm:grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <Card key={index} className="relative border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20">
                    {step.icon}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                    {step.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
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
        heading="Si te sientes así, estás en el lugar correcto."
        reasons={[
          {
            title: "Estudias sin Rumbo",
            description: "Pasas horas repasando materia, pero no sabes si estás enfocándote en lo que realmente te dará más puntos en el examen.",
            icon: <Compass className="size-6" />
          },
          {
            title: "La 'Lógica' te Abruma", 
            description: "Sientes que la 'lógica matemática' del TEC y la UCR es un juego de adivinanzas que el cole nunca te enseñó a jugar.",
            icon: <Clock className="size-6" />
          },
          {
            title: "Ansiedad por el Tiempo",
            description: "Te preocupa quedarte pegado en una pregunta y que el tiempo no te alcance para terminar la prueba con calma.",
            icon: <Brain className="size-6" />
          }
        ]}
      />

      {/* Solution Section */}
      <SolutionSection />

      {/* Testimonial Section */}
      <Testimonial10 
        quote="Esos exámenes son más de aptitud que de conocimiento... la forma de prepararse es hacer mucha, pero mucha práctica, porque un componente grande es tu capacidad de manejar tu propio tiempo y tu estrés."
        author={{
          name: "Un estudiante en r/Ticos",
          role: "Futuro Cachimba",
          avatar: {
            src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
            alt: "Estudiante"
          }
        }}
      />

      {/* Final CTA Section */}
      <Cta10 
        heading="Tu futuro empieza hoy."
        description="Deja la ansiedad. Toma el control. Descubre tus Zonas Rojas ahora."
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
