import { Target, CheckCircle, BookOpen } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { AnimateOnScroll } from "~/components/ui/animate-on-scroll";
import { StaggerGrid, StaggerItem } from "~/components/ui/stagger-grid";

// Custom Solution Section
export const SolutionSection = () => {
  const steps = [
    {
      number: "1",
      title: "Responde 10 preguntas",
      description: "Respondé 10 preguntas clave. En segundos, encontramos tu patrón de errores. No te hacemos perder el tiempo.",
      icon: <Target className="size-8 text-primary" />
    },
    {
      number: "2", 
      title: "Recibe tus 3 Zonas Rojas",
      description: "Te mostramos las 3 áreas exactas donde tenés que enfocar tu esfuerzo de último minuto para el máximo impacto.",
      icon: <CheckCircle className="size-8 text-primary" />
    },
    {
      number: "3",
      title: "Domina un tema ¡YA!",
      description: "Con nuestra Micro-Dosis y el Machote en PDF, sentí el alivio inmediato de ver que podés mejorar rápido.",
      icon: <BookOpen className="size-8 text-primary" />
    }
  ];

  return (
    <section className="w-full py-24 md:py-36 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimateOnScroll animation="fadeInUp" delay={0.2}>
          <div className="text-center mb-16">
            <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Te damos un plan de ataque en 3 simples pasos
            </h2>
          </div>
        </AnimateOnScroll>
        
        <StaggerGrid 
          className="grid gap-8 md:gap-12 sm:grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto"
          staggerDelay={0.15}
        >
          {steps.map((step, index) => (
            <StaggerItem key={index}>
              <Card className="relative border border-border/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-background/80 backdrop-blur-sm">
                <CardContent className="p-8 md:p-10">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/0">
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
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}; 