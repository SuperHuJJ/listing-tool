import { z } from 'zod';

export const generateRequestSchema = z.object({
  platform: z.enum(['amazon', 'shopify', 'ebay']),
  language: z.enum(['en', 'de', 'ja', 'fr', 'es']),
  productInfo: z.object({
    name: z.string().min(1).max(200),
    features: z.string().min(1).max(1000),
    keywords: z.string().min(1).max(500),
    targetAudience: z.string().optional(),
    brandName: z.string().optional(),
  }),
});