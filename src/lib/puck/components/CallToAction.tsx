import { ComponentConfig } from "@puckeditor/core";

export type CallToActionProps = {
  headline: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  alignment: "left" | "center" | "right";
  backgroundColor: string;
  textColor: string;
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
  marginTop: string;
  marginBottom: string;
};

export const CallToAction: ComponentConfig<CallToActionProps> = {
  label: "Call to Action",
  fields: {
    headline: {
      type: "text",
      label: "Headline",
    },
    description: {
      type: "textarea",
      label: "Description",
    },
    primaryButtonText: {
      type: "text",
      label: "Primary Button Text",
    },
    primaryButtonLink: {
      type: "text",
      label: "Primary Button Link",
    },
    secondaryButtonText: {
      type: "text",
      label: "Secondary Button Text",
    },
    secondaryButtonLink: {
      type: "text",
      label: "Secondary Button Link",
    },
    alignment: {
      type: "select",
      label: "Alignment",
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
  },
  defaultProps: {
    headline: "Ready to Get Started?",
    description: "Join thousands of satisfied customers and take your business to the next level. No credit card required.",
    primaryButtonText: "Start Free Trial",
    primaryButtonLink: "#",
    secondaryButtonText: "Schedule Demo",
    secondaryButtonLink: "#",
    alignment: "center",
    backgroundColor: "#4f46e5",
    textColor: "#ffffff",
    paddingTop: "80px",
    paddingBottom: "80px",
    paddingLeft: "24px",
    paddingRight: "24px",
    marginTop: "0px",
    marginBottom: "0px",
  },
  render: ({
    headline,
    description,
    primaryButtonText,
    primaryButtonLink,
    secondaryButtonText,
    secondaryButtonLink,
    alignment,
    backgroundColor,
    textColor,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    marginTop,
    marginBottom,
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
        }}
        className={`flex flex-col ${alignmentClass}`}
      >
        <div className="max-w-3xl mx-auto w-full">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{headline}</h2>
          <p className="text-lg opacity-90 mb-8">{description}</p>
          <div className={`flex flex-col sm:flex-row gap-4 ${alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : "justify-start"}`}>
            {primaryButtonText && (
              <a
                href={primaryButtonLink}
                className="inline-block px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                {primaryButtonText}
              </a>
            )}
            {secondaryButtonText && (
              <a
                href={secondaryButtonLink}
                className="inline-block px-8 py-4 border-2 border-white/30 font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                {secondaryButtonText}
              </a>
            )}
          </div>
        </div>
      </section>
    );
  },
};
