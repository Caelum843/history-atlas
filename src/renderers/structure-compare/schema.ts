import { z } from 'astro/zod';
import { i18n } from '../../lib/schema';

/**
 * structure-compare —— 制度表象与实际权力的前后对照。
 * 计划用于《奥古斯都掌权》。M5 之后实现。
 */
const node = z.object({
  id: z.string(),
  label: i18n,
  column: z.enum(['nominal', 'actual']),
});

export const structureCompareSchema = z.object({
  before: z.object({ label: i18n, nodes: z.array(node), edges: z.array(z.tuple([z.string(), z.string()])) }),
  after:  z.object({ label: i18n, nodes: z.array(node), edges: z.array(z.tuple([z.string(), z.string()])) }),
}).strict();

export type StructureCompareConfig = z.infer<typeof structureCompareSchema>;
