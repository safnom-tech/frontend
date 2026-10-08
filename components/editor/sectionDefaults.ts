import type { SectionType } from "@/types/page";

export function defaultSectionData(type: SectionType): Record<string, unknown> {
  switch (type) {
    case "HEADER":
      return { logoText: "Your brand", navLabel: "Menu" };
    case "HERO":
      return {
        title: "Welcome",
        description: "Tell visitors what you do.",
        buttonText: "Get started",
        buttonUrl: "#contact",
        secondaryButtonText: "",
        secondaryButtonUrl: "",
        imageUrl: "",
        imageAlt: "",
      };
    case "TEXT":
      return { heading: "Section title", body: "Add your content here." };
    case "IMAGE":
      return { url: "", alt: "Image description" };
    case "SERVICES":
      return {
        heading: "Our services",
        items: ["Service one", "Service two", "Service three"],
      };
    case "FEATURES":
      return {
        heading: "Features",
        items: ["Fast setup", "Mobile friendly", "Secure hosting"],
      };
    case "GALLERY":
      return { heading: "Gallery", images: [] as { url: string; alt: string }[] };
    case "TESTIMONIALS":
      return {
        heading: "Testimonials",
        quote: "Great experience working together.",
        author: "Happy customer",
      };
    case "PRICING":
      return {
        heading: "Pricing",
        planName: "Starter",
        price: "$19/mo",
        features: ["Feature A", "Feature B"],
      };
    case "FAQ":
      return {
        heading: "FAQ",
        items: [{ q: "Question?", a: "Answer." }],
      };
    case "CONTACT":
      return {
        heading: "Contact us",
        body: "Send us a message and we’ll reply as soon as we can.",
        email: "",
        submitLabel: "Send message",
        buttonText: "Send message",
        successMessage: "Thanks — your message was sent.",
      };
    case "FOOTER":
      return { copyright: "© Your company", links: "Privacy · Terms" };
    case "COMPOSED":
      return {
        schemaVersion: 1,
        section: {
          semanticType: "custom",
          layout: "empty",
          root: { type: "container", children: [{ type: "text", props: { text: "Custom section" } }] },
        },
      };
    default:
      return {};
  }
}

export function defaultSectionSettings(
  type: SectionType
): Record<string, unknown> {
  if (type === "HERO") {
    return {
      alignment: "left",
      paddingY: "lg",
      layout: "split",
      imagePosition: "right",
      imageRadius: "lg",
      fontSize: "lg",
      fontWeight: "bold",
    };
  }
  return { alignment: "left", paddingY: "md" };
}
