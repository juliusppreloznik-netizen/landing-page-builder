import { ComponentConfig, DropZone } from "@puckeditor/core";

export type FeatureGridProps = {
  columns: "2" | "3" | "4";
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

export const FeatureGrid: ComponentConfig<FeatureGridProps> = {
  label: "Feature Grid",
  fields: {
    columns: {
      type: "select",
      label: "Columns",
      options: [
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
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
    columns: "3",
    backgroundColor: "#0f172a",
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
    columns,
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
    const gridCols = {
      "2": "md:grid-cols-2",
      "3": "md:grid-cols-3",
      "4": "md:grid-cols-2 lg:grid-cols-4",
    }[columns];

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
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <DropZone zone="feature-header" />
          </div>
          <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
            <DropZone zone="feature-items" />
          </div>
        </div>
      </section>
    );
  },
};
