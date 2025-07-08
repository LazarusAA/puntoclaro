import {
  BatteryCharging,
  GitPullRequest,
  Layers,
  RadioTower,
  SquareKanban,
  WandSparkles,
} from "lucide-react";

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
    <section className="w-full py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 md:mb-20">
          <h2 className="mb-6 text-center text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {heading}
          </h2>
        </div>
        <div className="grid gap-12 md:gap-16 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {reasons.map((reason, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-accent border-2 border-accent/20">
                {reason.icon}
              </div>
              <h3 className="mb-4 text-xl md:text-2xl font-bold">{reason.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Feature43 };
