import React from "react";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

interface Footer7Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: "Product",
    links: [
      { name: "Overview", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Marketplace", href: "#" },
      { name: "Features", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Team", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help", href: "#" },
      { name: "Sales", href: "#" },
      { name: "Advertise", href: "#" },
      { name: "Privacy", href: "#" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
];

const Footer7 = ({
  logo = {
    url: "https://umbral.cr",
    src: "/logo.svg",
    alt: "logo",
    title: "Umbral",
  },
  sections = defaultSections,
  description = "Tu futuro empieza hoy",
  socialLinks = defaultSocialLinks,
  copyright = "© 2025 Umbral. Todos los derechos reservados.",
  legalLinks = defaultLegalLinks,
}: Footer7Props) => {
  return (
    <section className="w-full py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex w-full flex-col justify-between gap-16 lg:flex-row lg:items-start lg:text-left max-w-7xl mx-auto">
          <div className="flex w-full flex-col justify-between gap-8 lg:items-start lg:max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-3 lg:justify-start">
              <a href={logo.url}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.title}
                  width={56}
                  height={56}
                  className="h-14 w-14 object-contain"
                />
              </a>
              <h2 className="text-2xl font-bold">{logo.title}</h2>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed">
              {description}
            </p>
            <ul className="text-muted-foreground flex items-center space-x-8">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="hover:text-primary font-medium transition-colors">
                  <a href={social.href} aria-label={social.label} className="block p-2">
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-8 md:gap-12 sm:grid-cols-1 md:grid-cols-3 lg:gap-16">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-6 text-lg font-bold">{section.title}</h3>
                <ul className="text-muted-foreground space-y-4 text-sm">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="hover:text-primary font-medium transition-colors"
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="text-muted-foreground mt-12 flex flex-col justify-between gap-6 border-t pt-8 text-sm font-medium md:flex-row md:items-center md:text-left max-w-7xl mx-auto">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-4 md:order-2 md:flex-row md:gap-8">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-primary transition-colors">
                <a href={link.href}>{link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export { Footer7 };
