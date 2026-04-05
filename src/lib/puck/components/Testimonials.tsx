import { ComponentConfig } from "@puckeditor/core";

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
};

export type TestimonialsProps = {
  heading: string;
  subheading: string;
  testimonials: Testimonial[];
  layout: "grid" | "carousel";
  backgroundColor: string;
  textColor: string;
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
  marginTop: string;
  marginBottom: string;
};

export const Testimonials: ComponentConfig<TestimonialsProps> = {
  label: "Testimonials",
  fields: {
    heading: {
      type: "text",
      label: "Section Heading",
    },
    subheading: {
      type: "textarea",
      label: "Section Subheading",
    },
    testimonials: {
      type: "array",
      label: "Testimonials",
      arrayFields: {
        quote: { type: "textarea", label: "Quote" },
        author: { type: "text", label: "Author Name" },
        role: { type: "text", label: "Role" },
        company: { type: "text", label: "Company" },
      },
      defaultItemProps: {
        quote: "This product has transformed how we work.",
        author: "Jane Doe",
        role: "CEO",
        company: "Acme Inc",
      },
    },
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
  },
  defaultProps: {
    heading: "Trusted by Industry Leaders",
    subheading: "See what our customers have to say about their experience.",
    testimonials: [
      {
        quote: "This platform has completely transformed our workflow. We've seen a 40% increase in productivity since switching.",
        author: "Sarah Chen",
        role: "VP of Operations",
        company: "TechCorp",
      },
      {
        quote: "The best investment we've made this year. The ROI was evident within the first month.",
        author: "Michael Rodriguez",
        role: "Founder",
        company: "StartupXYZ",
      },
      {
        quote: "Outstanding support team and an incredibly intuitive product. Highly recommended.",
        author: "Emily Watson",
        role: "CTO",
        company: "InnovateCo",
      },
    ],
    layout: "grid",
    backgroundColor: "#1e293b",
    textColor: "#ffffff",
    paddingTop: "80px",
    paddingBottom: "80px",
    paddingLeft: "24px",
    paddingRight: "24px",
    marginTop: "0px",
    marginBottom: "0px",
  },
  render: ({
    heading,
    subheading,
    testimonials,
    layout,
    backgroundColor,
    textColor,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    marginTop,
    marginBottom,
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
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">{subheading}</p>
          </div>
          <div
            className={
              layout === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory"
            }
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl bg-white/5 ${
                  layout === "carousel" ? "min-w-[300px] snap-center" : ""
                }`}
              >
                <div className="mb-4">
                  <svg
                    className="w-8 h-8 text-indigo-400 opacity-50"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-lg mb-6 opacity-90">{testimonial.quote}</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm opacity-70">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
};
