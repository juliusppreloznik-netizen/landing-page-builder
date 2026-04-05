import { ComponentConfig, DropZone } from "@puckeditor/core";

export type GridProps = {
  columns: "1" | "2" | "3" | "4";
  gap: string;
  marginTop: string;
  marginBottom: string;
};

export const Grid: ComponentConfig<GridProps> = {
  label: "Grid",
  fields: {
    columns: {
      type: "select",
      label: "Columns",
      options: [
        { label: "1 Column", value: "1" },
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
      ],
    },
    gap: {
      type: "text",
      label: "Gap",
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
    columns: "3",
    gap: "32px",
    marginTop: "48px",
    marginBottom: "0px",
  },
  render: ({ columns, gap, marginTop, marginBottom }) => {
    const gridClass = {
      "1": "grid-cols-1",
      "2": "grid-cols-1 md:grid-cols-2",
      "3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      "4": "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    }[columns];

    return (
      <div
        style={{ gap, marginTop, marginBottom }}
        className={`grid ${gridClass} w-full`}
      >
        <DropZone zone="items" />
      </div>
    );
  },
};
