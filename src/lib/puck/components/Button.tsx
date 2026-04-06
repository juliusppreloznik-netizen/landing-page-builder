import { ComponentConfig } from "@puckeditor/core";

export type ButtonProps = {
  text: string;
  link: string;
  variant: "primary" | "secondary" | "outline";
  size: "sm" | "md" | "lg";
  backgroundColor: string;
  textColor: string;
  marginTop: string;
  marginBottom: string;
  marginRight: string;
  borderRadius: string;
};

export const Button: ComponentConfig<ButtonProps> = {
  label: "Button",
  fields: {
    text: {
      type: "text",
      label: "Button Text",
    },
    link: {
      type: "text",
      label: "Link URL",
    },
    variant: {
      type: "select",
      label: "Variant",
      options: [
        { label: "Primary (Filled)", value: "primary" },
        { label: "Secondary (Light)", value: "secondary" },
        { label: "Outline", value: "outline" },
      ],
    },
    size: {
      type: "select",
      label: "Size",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
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
    marginTop: {
      type: "text",
      label: "Margin Top",
    },
    marginBottom: {
      type: "text",
      label: "Margin Bottom",
    },
    marginRight: {
      type: "text",
      label: "Margin Right",
    },
    borderRadius: {
      type: "text",
      label: "Border Radius",
    },
  },
  defaultProps: {
    text: "Get Started",
    link: "#",
    variant: "primary",
    size: "lg",
    backgroundColor: "#4f46e5",
    textColor: "#ffffff",
    marginTop: "0px",
    marginBottom: "0px",
    marginRight: "0px",
    borderRadius: "8px",
  },
  render: ({ text, link, variant, size, backgroundColor, textColor, marginTop, marginBottom, marginRight, borderRadius }) => {
    const sizeClass = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    }[size];

    const variantStyles = {
      primary: {
        backgroundColor,
        color: textColor,
        border: "none",
      },
      secondary: {
        backgroundColor: "#ffffff",
        color: backgroundColor,
        border: "none",
      },
      outline: {
        backgroundColor: "transparent",
        color: textColor,
        border: `2px solid ${textColor}`,
      },
    }[variant];

    return (
      <a
        href={link}
        style={{
          ...variantStyles,
          marginTop,
          marginBottom,
          marginRight,
          borderRadius,
          display: "inline-block",
        }}
        className={`${sizeClass} font-semibold hover:opacity-90 transition-opacity cursor-pointer`}
      >
        {text}
      </a>
    );
  },
};
