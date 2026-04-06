import { ComponentConfig, DropZone } from "@puckeditor/core";

export type TestimonialsProps = {
  layout: "grid" | "carousel";
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

export const Testimonials: ComponentConfig<TestimonialsProps> = {
  label: "Testimonials",
  fields: {
    layout: {
      type: "select",
      label: "Layout",
      options: [
        { label: "Grid", value: "grid" },
        { label: "Carousel", value: "carousel" },
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
    layout: "grid",
    backgroundColor: "#1e293b",
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
    layout,
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
            <DropZone zone="testimonial-header" />
          </div>
          <div
            className={
              layout === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory"
            }
          >
            <DropZone zone="testimonial-items" />
          </div>
        </div>
      </section>
    );
  },
};
