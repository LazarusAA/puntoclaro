import { ExternalLink } from "lucide-react";

import { Button } from "~/components/ui/button";

const Hero12 = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-30">
      <div className="absolute inset-x-0 top-0 flex h-full w-full items-center justify-center opacity-100">
        <img
          alt="background"
          src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/square-alt-grid.svg"
          className="[mask-image:radial-gradient(75%_75%_at_center,white,transparent)] opacity-90"
        />
      </div>
      <div className="relative z-10 w-full py-12 md:py-16">
        <div className="container mx-auto px-4 lg:px-8 flex max-w-5xl flex-col items-center">
          <div className="flex flex-col items-center gap-6 text-center">
            <div>
              <img
                src="/horizontal-logo.svg"
                alt="PuntoClaro Logo"
                className="h-20 md:h-28 lg:h-32 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="mb-6 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-pretty">
                ¿La <span className="text-primary">jupa nublada</span> por el examen de admisión?
              </h1>
              <p className="mx-auto max-w-2xl md:max-w-3xl text-lg md:text-xl text-muted-foreground leading-relaxed">
                Deja de estudiar a ciegas. Descubre gratis en 90 segundos cuáles son las 3 áreas que de verdad necesitas mejorar para asegurar tu futuro con la PAA.
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 items-center">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 shadow-sm hover:shadow transition-all hover:scale-105">
                Empezar mi Diagnóstico GRATIS
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto group text-lg px-8 py-6 flex items-center justify-center">
                <a href="#problem-section" className="scroll-smooth">
                  Ver cómo funciona{" "}
                  <ExternalLink className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero12 };
