import { defineType, defineField } from "sanity";

export default defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero Subtitle",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "heroCtaText",
      title: "Hero CTA Text",
      type: "string",
      description: "Call-to-action button text",
    }),
    defineField({
      name: "heroCtaLink",
      title: "Hero CTA Link",
      type: "string",
      description: "Call-to-action button link (e.g., /products)",
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              title: "Name",
              type: "string",
            },
            {
              name: "quote",
              title: "Quote",
              type: "text",
              rows: 4,
            },
            {
              name: "role",
              title: "Role",
              type: "string",
              description: "Customer role or title",
            },
            {
              name: "avatar",
              title: "Avatar",
              type: "image",
              options: {
                hotspot: true,
              },
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "heroTitle",
    },
  },
});

