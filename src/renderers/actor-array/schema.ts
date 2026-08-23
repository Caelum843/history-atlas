import { z } from 'astro/zod';
import { i18n } from '../../lib/schema';

/**
 * actor-array —— 人物集合的成分变化。
 * 计划用于《三月十五日》：元老院席位阵列随年份改变成分。
 * M5 扩展验证时实现 —— 届时用它检验公共结构是否真能支持非地图表达。
 */
const cohort = z.object({
  id: z.string(),
  label: i18n,
  count: z.number().int().nonnegative(),
  /** 人数估计的区间。古代人数几乎都不是精确值。 */
  countRange: z.tuple([z.number(), z.number()]).optional(),
});

export const actorArraySchema = z.object({
  total: z.number().int().positive(),
  cohorts: z.array(cohort).min(1),
  frames: z.array(z.object({
    id: z.string(),
    timeLabel: i18n,
    counts: z.record(z.string(), z.number()),
  })).min(1),
}).strict();

export type ActorArrayConfig = z.infer<typeof actorArraySchema>;
