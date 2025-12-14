import { defineType, defineField } from "sanity";

export default defineType({
  name: "testimonialSubmission",
  title: "Testimonial Submission",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().min(10),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description: "Customer role or title (optional)",
    }),
    defineField({
      name: "avatar",
      title: "Avatar",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Optional customer photo",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: "reviewedAt",
      title: "Reviewed At",
      type: "datetime",
      description: "When this testimonial was reviewed/approved",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "quote",
      status: "status",
    },
    prepare({ title, subtitle, status }) {
      return {
        title: `${title} (${status})`,
        subtitle: subtitle ? subtitle.substring(0, 60) + "..." : "",
      };
    },
  },
  orderings: [
    {
      title: "Submitted Date, Newest",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
    {
      title: "Status",
      name: "statusAsc",
      by: [{ field: "status", direction: "asc" }],
    },
  ],
});
