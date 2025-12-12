import { defineType, defineField } from "sanity";

export default defineType({
  name: "servicePageContent",
  title: "Product Page Content",
  type: "document",
  fields: [
    defineField({
      name: "serviceHandle",
      title: "Product Handle",
      type: "string",
      description:
        "Must match the Shopify product handle (e.g., 'turnset-dish-soap-concentrate')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "whatIsIncluded",
      title: "Details / How to Use",
      type: "array",
      of: [
        {
          type: "block",
        },
      ],
      description: "Rich text content describing usage, ingredients, and details",
    }),
    defineField({
      name: "bestFor",
      title: "Best For",
      type: "array",
      of: [{ type: "string" }],
      description: "List of use cases (e.g., 'Kitchen grease', 'Hard water', 'Pet odors')",
    }),
    defineField({
      name: "beforeAfterImages",
      title: "Before & After Images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: "alt",
              title: "Alt Text",
              type: "string",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "faqEntries",
      title: "FAQ Entries",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "question",
              title: "Question",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "answer",
              title: "Answer",
              type: "array",
              of: [
                {
                  type: "block",
                },
              ],
            },
          ],
          preview: {
            select: {
              title: "question",
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "serviceHandle",
    },
    prepare({ title }) {
      return {
        title: `Product: ${title}`,
      };
    },
  },
});

