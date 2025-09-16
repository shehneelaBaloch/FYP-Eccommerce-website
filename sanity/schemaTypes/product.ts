import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'product',
  title: 'Products',
  type: 'document',
  fields: [
    // Product Name
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    // Slug
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),

    // Price
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),

    // Original Price
    defineField({
      name: 'originalPrice',
      title: 'Original Price',
      type: 'number',
    }),

    // Rating
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      initialValue: 0,
    }),

    // Discount
    defineField({
      name: 'discount',
      title: 'Discount (%)',
      type: 'number',
    }),

    // New Product flag
    defineField({
      name: 'isNew',
      title: 'New Product',
      type: 'boolean',
      initialValue: false,
    }),

    // ✅ Trending Product flag
    defineField({
      name: 'isTrending',
      title: 'Trending Product',
      type: 'boolean',
      initialValue: false,
    }),

    // Category reference (connects to category schema)
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
    }),

    // Product Image
    defineField({
      name: 'image',
      title: 'Product Image',
      type: 'image',
      options: { hotspot: true },
    }),

    // Description
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
  ],
});
