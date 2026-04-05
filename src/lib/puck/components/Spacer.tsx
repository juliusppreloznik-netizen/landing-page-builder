import { ComponentConfig } from "@puckeditor/core";

export type SpacerProps = {
  height: string;
};

export const Spacer: ComponentConfig<SpacerProps> = {
  label: "Spacer",
  fields: {
    height: {
      type: "text",
      label: "Height",
    },
  },
  defaultProps: {
    height: "48px",
  },
  render: ({ height }) => {
    return <div style={{ height }} />;
  },
};
