import { ComponentConfig, DropZone } from "@puckeditor/core";

export type ButtonGroupProps = {
  alignment: "left" | "center" | "right";
  gap: string;
  marginTop: string;
  marginBottom: string;
};

export const ButtonGroup: ComponentConfig<ButtonGroupProps> = {
  label: "Button Group",
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
    gap: {
      type: "text",
      label: "Gap Between Buttons",
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
    alignment: "center",
    gap: "16px",
    marginTop: "0px",
    marginBottom: "0px",
  },
  render: ({ alignment, gap, marginTop, marginBottom }) => {
    const alignmentClass = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    }[alignment];

    return (
      <div
        style={{ gap, marginTop, marginBottom }}
        className={`flex flex-wrap ${alignmentClass}`}
      >
        <DropZone zone="buttons" />
      </div>
    );
  },
};
