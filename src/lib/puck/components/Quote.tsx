import { ComponentConfig } from "@puckeditor/core";

export type QuoteProps = {
  text: string;
  author: string;
  role: string;
  company: string;
  textColor: string;
};

export const Quote: ComponentConfig<QuoteProps> = {
  label: "Quote",
  fields: {
    text: {
      type: "textarea",
      label: "Quote Text",
    },
    author: {
      type: "text",
      label: "Author Name",
    },
    role: {
      type: "text",
      label: "Role",
    },
    company: {
      type: "text",
      label: "Company",
    },
    textColor: {
      type: "text",
      label: "Text Color",
    },
  },
  defaultProps: {
    text: "This product has completely transformed how we work. Highly recommended!",
    author: "Jane Doe",
    role: "CEO",
    company: "Acme Inc",
    textColor: "#ffffff",
  },
  render: ({ text, author, role, company, textColor }) => {
    return (
      <div style={{ color: textColor }}>
        <div className="mb-4">
          <svg
            className="w-8 h-8 opacity-50"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
        <p className="text-lg mb-6 opacity-90">{text}</p>
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-sm opacity-70">
            {role}, {company}
          </p>
        </div>
      </div>
    );
  },
};
