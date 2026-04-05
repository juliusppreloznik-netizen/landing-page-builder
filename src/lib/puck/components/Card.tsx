import { ComponentConfig, DropZone } from "@puckeditor/core";

export type CardProps = {
  backgroundColor: string;
  padding: string;
  borderRadius: string;
  border: string;
};

export const Card: ComponentConfig<CardProps> = {
  label: "Card",
  fields: {
    backgroundColor: {
      type: "text",
      label: "Background Color",
    },
    padding: {
      type: "text",
      label: "Padding",
    },
    borderRadius: {
      type: "text",
      label: "Border Radius",
    },
    border: {
      type: "text",
      label: "Border",
    },
  },
  defaultProps: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: "24px",
    borderRadius: "12px",
    border: "none",
  },
  render: ({ backgroundColor, padding, borderRadius, border }) => {
    return (
      <div
        style={{
          backgroundColor,
          padding,
          borderRadius,
          border,
        }}
        className="transition-colors hover:bg-white/10"
      >
        <DropZone zone="card-content" />
      </div>
    );
  },
};
