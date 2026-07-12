import { defineCollection, z } from 'astro:content';

const optionalDate = z.preprocess(
  (value) => value === '' || value === null ? undefined : value,
  z.coerce.date().optional(),
);

const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    language: z.enum(['en', 'bn']),
    translationKey: z.string(),
    urlSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: optionalDate,
    author: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    featuredImage: z.string().optional(),
    featuredImageAlt: z.string().optional(),
    draft: z.boolean().default(false),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    canonical: z.string().optional(),
    verificationStatus: z.enum(['officially-confirmed', 'under-verification', 'corrected', 'withdrawn', 'closed']).default('under-verification'),
    sourceUrls: z.array(z.string().url()).default([]),
    officialNoticeUrl: z.string().url().optional(),
    applicationUrl: z.string().url().optional(),
    lastVerified: optionalDate,
    deadline: optionalDate,
  }),
});

const authorsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    bio: z.string().optional(),
    image: z.string().optional(),
    email: z.string().optional(),
    twitter: z.string().optional(),
    github: z.string().optional(),
  }),
});

const categoriesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    nameEn: z.string(),
    nameBn: z.string(),
    descriptionEn: z.string().optional(),
    descriptionBn: z.string().optional(),
    color: z.string().optional(),
  }),
});

export const collections = {
  articles: articlesCollection,
  authors: authorsCollection,
  categories: categoriesCollection,
};
