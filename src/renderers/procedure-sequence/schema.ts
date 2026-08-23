import { z } from 'astro/zod';
import { i18n, evidenceStatus } from '../../lib/schema';

/**
 * procedure-sequence —— 一套程序被依次走完（或被依次绕过）。
 *
 * 卢比孔拍 3 用它：提案 → 保民官否决 → 否决被压制 → 非常措施。
 * 同样不是罗马专用：任何"制度手段逐级用尽"的历史问题结构相同。
 */
const stage = z.object({
  id: z.string(),
  label: i18n,
  /** 这一步的结果。exhausted 指手段用过但没解决问题。 */
  outcome: z.enum(['completed', 'vetoed', 'overridden', 'exhausted', 'extraordinary']),
  status: evidenceStatus,
  timeLabel: i18n.optional(),
  claims: z.array(z.string()).default([]),
  note: i18n.optional(),
});

export const procedureSequenceSchema = z.object({
  stages: z.array(stage).min(2),
  /** 走完程序后镜头落到哪里（可选，用于与地图场景衔接） */
  endsAt: z.string().optional(),
}).strict();

export type ProcedureSequenceConfig = z.infer<typeof procedureSequenceSchema>;
