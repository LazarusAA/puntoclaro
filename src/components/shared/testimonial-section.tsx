import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { AnimatedSection } from "./animated-section";

interface Testimonial10Props {
  quote?: string;
  author?: {
    name: string;
    role: string;
    avatar: {
      src: string;
      alt: string;
    };
  };
}

const Testimonial10 = ({
  quote = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig doloremque mollitia fugiat omnis! Porro facilis quo animi consequatur. Explicabo.",
  author = {
    name: "Customer Name",
    role: "Role",
    avatar: {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
      alt: "Customer Name",
    },
  },
}: Testimonial10Props) => {
  return (
    <section className="w-full py-24 md:py-36 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          <AnimatedSection preset="fadeInUp" delay={0.2}>
            <p className="mb-16 md:mb-20 font-medium text-lg md:text-2xl lg:text-3xl leading-relaxed">
              &ldquo;{quote}&rdquo;
            </p>
          </AnimatedSection>
          
          <AnimatedSection preset="scaleUp" delay={0.4}>
            <div className="flex items-center gap-4 md:gap-6">
              <Avatar className="size-16 md:size-20 border-2 border-primary/20">
                <AvatarImage src={author.avatar.src} alt={author.avatar.alt} />
                <AvatarFallback className="text-lg font-bold">{author.name}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-base md:text-lg font-bold">{author.name}</p>
                <p className="text-muted-foreground text-sm md:text-base">
                  {author.role}
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export { Testimonial10 };
