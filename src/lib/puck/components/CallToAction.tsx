import { ComponentConfig, DropZone } from "@puckeditor/core";

export type CallToActionProps = {
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

export const CallToAction: ComponentConfig<CallToActionProps> = {
  label: "Call to Action",
  fields: {
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
    borderRadius: {
      type: "text",
      label: "Border Radius",
    },
  },
  defaultProps: {
    alignment: "center",
    backgroundColor: "#4f46e5",
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
        <div className="max-w-3xl mx-auto w-full">
          <DropZone zone="cta-content" />
        </div>
      </section>
    );
  },
};
