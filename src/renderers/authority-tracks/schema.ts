import { z } from 'astro/zod';
import { i18n, evidenceStatus } from '../../lib/schema';

/**
 * authority-tracks —— 多个维度共用一条时间轴，各自在不同时点变化。
 *
 * 卢比孔拍 2 / 拍 5 的 imperium 四维面板用它。
 * 但它不是"imperium 专用"：任何"一件事的若干侧面并不同步变化"的历史问题都能用
 * ——某项权利的法律地位 / 社会承认 / 当事人主张 / 实际执行，结构是一样的。
 *
 * 设计约束（decisions.md 第二轮）：
 * 不允许退化成单一状态条。单条轨道会给出一个不存在的唯一答案。
 */

/** 共享时间节点。移动端的四行事件矩阵靠它离散化时间轴。 */
const node = z.object({
  id: z.string(),
  label: i18n,
  sortKey: z.number(),
  /** 是否为全场的公共对齐点（如"越河"）。整个面板最多一个。 */
  pivot: z.boolean().default(false),
});

/** 一条轨道在某个节点上的状态。 */
const cell = z.object({
  node: z.string(),
  /** 这一格相对上一格是否变化 —— "错位"论点全靠它。 */
  changed: z.boolean(),
  label: i18n,
  status: evidenceStatus,
  /** 变化是突变还是渐变。渐变的不画成一个时点。 */
  mode: z.enum(['step', 'gradual', 'none']).default('step'),
  claims: z.array(z.string()).default([]),   // 引用 beat.claims 的 id
});

const track = z.object({
  id: z.string(),
  label: i18n,
  /** 整条轨道的证据等级。disputed 的轨道在界面上必须与其他轨道可区分。 */
  status: evidenceStatus,
  note: i18n.optional(),
  cells: z.array(cell).min(1),
});

export const authorityTracksSchema = z.object({
  nodes: z.array(node).min(2),
  tracks: z.array(track).min(2),
  /**
   * 桌面端横向并列，移动端改为共享时间节点的四行事件矩阵，
   * 纵向滚动推动同一个时间游标。**不使用横向滚动画布。**
   */
  mobileLayout: z.literal('shared-node-matrix').default('shared-node-matrix'),
}).strict().superRefine((v, ctx) => {
  if (v.tracks.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom, path: ['tracks'],
      message: '至少两条轨道。单条轨道会退化成状态条，制造不存在的唯一答案。',
    });
  }
  const pivots = v.nodes.filter((n) => n.pivot);
  if (pivots.length > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom, path: ['nodes'],
      message: `最多一个 pivot 节点，当前有 ${pivots.length} 个。公共对齐点只能有一个。`,
    });
  }
  const ids = new Set(v.nodes.map((n) => n.id));
  v.tracks.forEach((t, ti) => {
    t.cells.forEach((c, ci) => {
      if (!ids.has(c.node)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom, path: ['tracks', ti, 'cells', ci, 'node'],
          message: `轨道 "${t.id}" 引用了不存在的节点 "${c.node}"。`,
        });
      }
    });
  });
  // 如果每条轨道都在同一个节点变化，那"错位"就不存在，这个渲染器也就没必要用。
  const changePoints = v.tracks.map(
    (t) => t.cells.filter((c) => c.changed).map((c) => c.node).join(','),
  );
  if (changePoints.length > 1 && new Set(changePoints).size === 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom, path: ['tracks'],
      message:
        '所有轨道的变化时点完全相同 —— 那就没有"错位"可言，' +
        '用这个渲染器没有意义，考虑换一种表达。',
    });
  }
});

export type AuthorityTracksConfig = z.infer<typeof authorityTracksSchema>;
