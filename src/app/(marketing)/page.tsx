import { Compass, Clock, Brain } from "lucide-react";
import { Feature43 } from "~/components/shared/problem-section";
import { Hero12 } from "~/components/shared/hero-section";
import { SolutionSection } from "~/components/shared/solution-section";
import { Testimonial10 } from "~/components/shared/testimonial-section";
import { Cta10 } from "~/components/shared/call-to-action";

// Structured data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Umbral",
  "description": "Plataforma de preparación para la PAA con diagnósticos personalizados",
  "url": "https://umbral.cr", // Replace with your domain
  "logo": "https://umbral.cr/logo.svg", // Replace with your domain
  "sameAs": [
    // Add your social media URLs here when available
    // "https://facebook.com/umbral",
    // "https://instagram.com/umbral"
  ],
  "offers": {
    "@type": "Offer",
    "name": "Diagnóstico PAA Gratis",
    "description": "Evaluación gratuita de 90 segundos para identificar áreas de mejora en la PAA",
    "price": "0",
    "priceCurrency": "CRC",
    "category": "Educational Assessment"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Costa Rica"
  },
  "educationalCredentialAwarded": "Preparación PAA",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Servicios de Preparación",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Diagnóstico Gratuito PAA",
          "description": "Identifica tus 3 zonas rojas de mejora en 90 segundos"
        }
      }
    ]
  }
};

export default function LandingPage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
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
              url: "/diagnostic"
            }
          }}
        />
      </div>
    </>
  );
}
