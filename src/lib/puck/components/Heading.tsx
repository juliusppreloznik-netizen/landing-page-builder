import { ComponentConfig } from "@puckeditor/core";

export type HeadingProps = {
  text: string;
  level: "h1" | "h2" | "h3" | "h4";
  color: string;
  marginBottom: string;
};

export const Heading: ComponentConfig<HeadingProps> = {
  label: "Heading",
  fields: {
    text: {
      type: "textarea",
      label: "Text",
    },
    level: {
      type: "select",
      label: "Level",
      options: [
        { label: "H1 - Main Title", value: "h1" },
        { label: "H2 - Section Title", value: "h2" },
        { label: "H3 - Subsection", value: "h3" },
        { label: "H4 - Small Title", value: "h4" },
      ],
    },
    color: {
      type: "text",
      label: "Color",
    },
    marginBottom: {
      type: "text",
      label: "Margin Bottom",
    },
  },
  defaultProps: {
    text: "Your Headline Here",
    level: "h1",
    color: "#ffffff",
    marginBottom: "24px",
  },
  render: ({ text, level, color, marginBottom }) => {
    const sizeClass = {
      h1: "text-4xl md:text-5xl lg:text-6xl font-bold leading-tight",
      h2: "text-3xl md:text-4xl font-bold",
      h3: "text-2xl md:text-3xl font-semibold",
      h4: "text-xl md:text-2xl font-semibold",
    }[level];

    const Tag = level;

    return (
      <Tag
        style={{ color, marginBottom }}
        className={sizeClass}
      >
        {text}
      </Tag>
    );
  },
};
