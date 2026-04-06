import { ComponentConfig } from "@puckeditor/core";

type Feature = {
  title: string;
  description: string;
  icon: string;
};

export type FeatureGridProps = {
  heading: string;
  subheading: string;
  features: Feature[];
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

const iconMap: Record<string, JSX.Element> = {
  bolt: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  chart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  clock: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  cog: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

export const FeatureGrid: ComponentConfig<FeatureGridProps> = {
  label: "Feature Grid",
  fields: {
    heading: {
      type: "text",
      label: "Section Heading",
    },
    subheading: {
      type: "textarea",
      label: "Section Subheading",
    },
    features: {
      type: "array",
      label: "Features",
      arrayFields: {
        title: { type: "text", label: "Title" },
        description: { type: "textarea", label: "Description" },
        icon: {
          type: "select",
          label: "Icon",
          options: [
            { label: "Bolt", value: "bolt" },
            { label: "Shield", value: "shield" },
            { label: "Chart", value: "chart" },
            { label: "Clock", value: "clock" },
            { label: "Users", value: "users" },
            { label: "Cog", value: "cog" },
          ],
        },
      },
      defaultItemProps: {
        title: "Feature",
        description: "Feature description",
        icon: "bolt",
      },
    },
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
    heading: "Everything You Need to Succeed",
    subheading: "Our comprehensive platform provides all the tools and features to help your business thrive.",
    features: [
      { title: "Lightning Fast", description: "Experience blazing speed with our optimized infrastructure.", icon: "bolt" },
      { title: "Secure by Default", description: "Enterprise-grade security protects your data 24/7.", icon: "shield" },
      { title: "Analytics Built-in", description: "Track performance with powerful analytics dashboards.", icon: "chart" },
    ],
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
    heading,
    subheading,
    features,
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">{subheading}</p>
          </div>
          <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center mb-4">
                  {iconMap[feature.icon] || iconMap.bolt}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="opacity-80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
};
