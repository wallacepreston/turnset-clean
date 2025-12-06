import { defineType, defineField } from "sanity";

export default defineType({
  name: "servicePageContent",
  title: "Service Page Content",
  type: "document",
  fields: [
    defineField({
      name: "serviceHandle",
      title: "Service Handle",
      type: "string",
      description:
        "Must match the Shopify product handle (e.g., 'deep-cleaning-service')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "whatIsIncluded",
      title: "What's Included",
      type: "array",
      of: [
        {
          type: "block",
        },
      ],
      description: "Rich text content describing what's included in the service",
    }),
    defineField({
      name: "bestFor",
      title: "Best For",
      type: "array",
      of: [{ type: "string" }],
      description: "List of use cases (e.g., 'Move-outs', 'Heavy use units')",
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
        title: `Service: ${title}`,
      };
    },
  },
});

