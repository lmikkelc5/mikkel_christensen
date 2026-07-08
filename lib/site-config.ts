export const siteConfig = {
  name: "Mikkel Christensen",
  title: "Mikkel Christensen | Writing, Photography, Recipes, and Projects",
  description:
    "A minimal personal website for publishing articles, showcasing projects, sharing photography, and collecting recipes.",
  url: "https://example.vercel.app",
  email: "hello@example.com",
  socialLinks: {
    github: "https://github.com/example",
    linkedin: "https://linkedin.com/in/example",
    x: "https://x.com/example"
  },
  navItems: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/articles", label: "Articles" },
    { href: "/photography", label: "Photography" },
    { href: "/recipes", label: "Recipes" },
    { href: "/projects", label: "Projects" },
    { href: "/contact", label: "Contact" }
  ]
} as const;
