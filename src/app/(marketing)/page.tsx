import { Compass, Clock, Brain } from "lucide-react";
import { Feature43 } from "~/components/shared/problem-section";
import { Hero12 } from "~/components/shared/hero-section";
import { SolutionSection } from "~/components/shared/solution-section";
import { Testimonial10 } from "~/components/shared/testimonial-section";
import { Cta10 } from "~/components/shared/call-to-action";



export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <Hero12 />

      {/* Problem Section */}
      <div id="problem-section">
        <Feature43 
        heading="Si te sientes así, estás en el lugar correcto"
        reasons={[
          {
            title: "Estudias sin rumbo",
            description: "Pasas horas repasando, pero no sabes si estás enfocándote en lo que realmente te dará más puntos en el examen.",
            icon: <Compass className="size-6" />
          },
          {
            title: "La lógica te abruma", 
            description: "Sientes que la lógica matemática del TEC y la UCR es un juego de adivinanzas que el cole nunca te enseñó a jugar.",
            icon: <Brain className="size-6" />
          },
          {
            title: "Ansiedad por el tiempo",
            description: "Te preocupa quedarte pegado en una pregunta y que el tiempo no te alcance para terminar la prueba con calma.",
            icon: <Clock className="size-6" />
          }
        ]}
      />
      </div>

      {/* Solution Section */}
      <SolutionSection />

      {/* Testimonial Section */}
      <Testimonial10 
        quote="Esos exámenes son más de aptitud que de conocimiento... la mejor forma de prepararse es hacer mucha, pero mucha práctica, porque un gran componente es tu capacidad de manejar tu propio tiempo y estrés."
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
