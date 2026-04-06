import { ComponentConfig } from "@puckeditor/core";

export type HeroSectionProps = {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  alignment: "left" | "center" | "right";
  backgroundColor: string;
  textColor: string;
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
  marginTop: string;
  marginBottom: string;
  borderRadius: string;
};

export const HeroSection: ComponentConfig<HeroSectionProps> = {
  label: "Hero Section",
  fields: {
    headline: {
      type: "text",
      label: "Headline",
    },
    subheadline: {
      type: "textarea",
      label: "Subheadline",
    },
    ctaText: {
      type: "text",
      label: "CTA Button Text",
    },
    ctaLink: {
      type: "text",
      label: "CTA Button Link",
    },
    alignment: {
      type: "select",
      label: "Text Alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    backgroundColor: {
      type: "text",
      label: "Background Color",
    },
    textColor: {
      type: "text",
      label: "Text Color",
    },
    paddingTop: {
      type: "text",
      label: "Padding Top",
    },
    paddingBottom: {
      type: "text",
      label: "Padding Bottom",
    },
    paddingLeft: {
      type: "text",
      label: "Padding Left",
    },
    paddingRight: {
      type: "text",
      label: "Padding Right",
    },
    marginTop: {
      type: "text",
      label: "Margin Top",
    },
    marginBottom: {
      type: "text",
      label: "Margin Bottom",
    },
    borderRadius: {
      type: "text",
      label: "Border Radius",
    },
  },
  defaultProps: {
    headline: "Transform Your Business Today",
    subheadline: "Join thousands of companies already using our platform to accelerate growth and maximize results.",
    ctaText: "Get Started Now",
    ctaLink: "#",
    alignment: "center",
    backgroundColor: "#1e293b",
    textColor: "#ffffff",
    paddingTop: "80px",
    paddingBottom: "80px",
    paddingLeft: "24px",
    paddingRight: "24px",
    marginTop: "0px",
    marginBottom: "0px",
    borderRadius: "0px",
  },
  render: ({
    headline,
    subheadline,
    ctaText,
    ctaLink,
    alignment,
    backgroundColor,
    textColor,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    marginTop,
    marginBottom,
    borderRadius,
  }) => {
    const alignmentClass = {
      left: "text-left items-start",
      center: "text-center items-center",
      right: "text-right items-end",
    }[alignment];

    return (
      <section
        style={{
          backgroundColor,
          color: textColor,
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
          marginTop,
          marginBottom,
          borderRadius,
        }}
        className={`flex flex-col ${alignmentClass}`}
      >
        <div className="max-w-4xl mx-auto w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {headline}
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl">
            {subheadline}
          </p>
          {ctaText && (
            <a
              href={ctaLink}
              className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
              {ctaText}
            </a>
          )}
        </div>
      </section>
    );
  },
};
