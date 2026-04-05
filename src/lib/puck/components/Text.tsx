import { ComponentConfig } from "@puckeditor/core";

export type TextProps = {
  content: string;
  size: "sm" | "base" | "lg" | "xl";
  color: string;
  opacity: string;
  marginBottom: string;
  maxWidth: string;
};

export const Text: ComponentConfig<TextProps> = {
  label: "Text",
  fields: {
    content: {
      type: "textarea",
      label: "Content",
    },
    size: {
      type: "select",
      label: "Size",
      options: [
        { label: "Small", value: "sm" },
        { label: "Base", value: "base" },
        { label: "Large", value: "lg" },
        { label: "Extra Large", value: "xl" },
      ],
    },
    color: {
      type: "text",
      label: "Color",
    },
    opacity: {
      type: "text",
      label: "Opacity (0-1)",
    },
    marginBottom: {
      type: "text",
      label: "Margin Bottom",
    },
    maxWidth: {
      type: "text",
      label: "Max Width",
    },
  },
  defaultProps: {
    content: "Your text content here. Add compelling copy that speaks to your audience.",
    size: "lg",
    color: "#ffffff",
    opacity: "0.9",
    marginBottom: "32px",
    maxWidth: "640px",
  },
  render: ({ content, size, color, opacity, marginBottom, maxWidth }) => {
    const sizeClass = {
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    }[size];

    return (
      <p
        style={{
          color,
          opacity: parseFloat(opacity),
          marginBottom,
          maxWidth,
        }}
        className={sizeClass}
      >
        {content}
      </p>
    );
  },
};
