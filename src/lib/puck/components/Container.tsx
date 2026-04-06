import { ComponentConfig, DropZone } from "@puckeditor/core";
import { ReactNode } from "react";

export type ContainerProps = {
  backgroundColor: string;
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
  marginTop: string;
  marginBottom: string;
  maxWidth: "full" | "7xl" | "6xl" | "5xl" | "4xl" | "3xl";
  alignment: "left" | "center" | "right";
  borderRadius: string;
};

export const Container: ComponentConfig<ContainerProps> = {
  label: "Container",
  fields: {
    backgroundColor: {
      type: "text",
      label: "Background Color",
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
    maxWidth: {
      type: "select",
      label: "Max Width",
      options: [
        { label: "Full", value: "full" },
        { label: "7xl (1280px)", value: "7xl" },
        { label: "6xl (1152px)", value: "6xl" },
        { label: "5xl (1024px)", value: "5xl" },
        { label: "4xl (896px)", value: "4xl" },
        { label: "3xl (768px)", value: "3xl" },
      ],
    },
    alignment: {
      type: "select",
      label: "Content Alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    borderRadius: {
      type: "text",
      label: "Border Radius",
    },
  },
  defaultProps: {
    backgroundColor: "#1e293b",
    paddingTop: "80px",
    paddingBottom: "80px",
    paddingLeft: "24px",
    paddingRight: "24px",
    marginTop: "0px",
    marginBottom: "0px",
    maxWidth: "6xl",
    alignment: "center",
    borderRadius: "0px",
  },
  render: ({
    backgroundColor,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    marginTop,
    marginBottom,
    maxWidth,
    alignment,
    borderRadius,
  }) => {
    const maxWidthClass = {
      full: "max-w-full",
      "7xl": "max-w-7xl",
      "6xl": "max-w-6xl",
      "5xl": "max-w-5xl",
      "4xl": "max-w-4xl",
      "3xl": "max-w-3xl",
    }[maxWidth];

    const alignmentClass = {
      left: "text-left items-start",
      center: "text-center items-center",
      right: "text-right items-end",
    }[alignment];

    return (
      <section
        style={{
          backgroundColor,
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
          marginTop,
          marginBottom,
          borderRadius,
        }}
      >
        <div className={`mx-auto ${maxWidthClass} flex flex-col ${alignmentClass}`}>
          <DropZone zone="content" />
        </div>
      </section>
    );
  },
};
