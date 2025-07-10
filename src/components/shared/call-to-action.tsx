import { Button } from "~/components/ui/button";
import { AnimateOnScroll } from "~/components/ui/animate-on-scroll";

interface Cta10Props {
  heading: string;
  description: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
}

const Cta10 = ({
  heading = "Call to Action",
  description = "Build faster with our collection of pre-built blocks. Speed up your development and ship features in record time.",
  buttons = {
    primary: {
      text: "Buy Now",
      url: "https://www.shadcnblocks.com",
    },
  },
}: Cta10Props) => {
  return (
    <section className="w-full py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="flex w-full flex-col gap-8 md:gap-12 lg:flex-row lg:items-center max-w-5xl mx-auto text-center lg:text-left">
          <AnimateOnScroll animation="slideInLeft" delay={0.2} className="flex-1">
            <div>
              <h3 className="mb-4 text-3xl font-bold md:mb-6 md:text-4xl lg:text-5xl lg:mb-8">
                {heading}
              </h3>
              <p className="text-muted-foreground text-lg md:text-xl lg:text-2xl leading-relaxed">
                {description}
              </p>
            </div>
          </AnimateOnScroll>
          
          <AnimateOnScroll animation="slideInRight" delay={0.4} className="flex shrink-0 flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row justify-center lg:justify-start">
            <div>
              {buttons.secondary && (
                <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6">
                  <a href={buttons.secondary.url}>{buttons.secondary.text}</a>
                </Button>
              )}
              {buttons.primary && (
                <Button asChild variant="default" size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <a href={buttons.primary.url}>{buttons.primary.text}</a>
                </Button>
              )}
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
};

export { Cta10 };
