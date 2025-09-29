import { defineType, defineField } from "sanity";

export default defineType({
  name: "category",
  title: "Categories",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Category Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    // ✅ Multiple optional slugs
    defineField({
      name: "slugs",
      title: "Slugs / Routes",
      type: "array",
      of: [
        {
          type: "slug",
          options: {
            source: "name",
            maxLength: 96,
          },
        },
      ],
      description:
        "Optional: Add one or more slugs/routes for this category. Leave empty if you want to link manually.",
      validation: (Rule) => Rule.min(0).max(10), // allow up to 10
    }),

    defineField({
      name: "image",
      title: "Category Image",
      type: "image",
      options: { hotspot: true },
    }),

    defineField({
      name: "productCount",
      title: "Product Count",
      type: "number",
      initialValue: 0,
    }),
  ],
});
