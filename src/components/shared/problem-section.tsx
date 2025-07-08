import {
  BatteryCharging,
  GitPullRequest,
  Layers,
  RadioTower,
  SquareKanban,
  WandSparkles,
} from "lucide-react";
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from "./animated-section";

interface Reason {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Feature43Props {
  heading?: string;
  reasons?: Reason[];
}

const Feature43 = ({
  heading = "Why Work With Us?",
  reasons = [
    {
      title: "Quality",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat?",
      icon: <GitPullRequest className="size-6" />,
    },
    {
      title: "Experience",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat?",
      icon: <SquareKanban className="size-6" />,
    },
    {
      title: "Support",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat?",
      icon: <RadioTower className="size-6" />,
    },
    {
      title: "Innovation",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat?",
      icon: <WandSparkles className="size-6" />,
    },
    {
      title: "Results",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat?",
      icon: <Layers className="size-6" />,
    },
    {
      title: "Efficiency",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat?",
      icon: <BatteryCharging className="size-6" />,
    },
  ],
}: Feature43Props) => {
  return (
    <section className="w-full py-32 md:py-48">
      <div className="container mx-auto px-4">
        <AnimatedSection preset="fadeInUp" delay={0.2}>
          <div className="mb-16 md:mb-20">
            <h2 className="mb-6 text-center text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {heading}
            </h2>
          </div>
        </AnimatedSection>
        
        <AnimatedGrid 
          className="grid gap-12 md:gap-16 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
          staggerDelay={0.15}
        >
          {reasons.map((reason, i) => (
            <AnimatedGridItem key={i}>
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/0 text-primary">
                  {reason.icon}
                </div>
                <h3 className="mb-4 text-xl md:text-2xl font-bold">{reason.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg">{reason.description}</p>
              </div>
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      </div>
    </section>
  );
};

export { Feature43 };
