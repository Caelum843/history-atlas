/**
 * Renderer registry —— 场景视觉的可扩展点。
 *
 * 设计意图（decisions.md 第二轮审核）：
 * 首轮的三种场景类型只是首轮实验的需要，**不是全站永久、封闭的清单**。
 * 公共 schema（src/lib/schema.ts）只校验 beat.visual.renderer 是个字符串；
 * config 的具体形状由各 renderer 在这里声明，构建时做第二遍校验。
 *
 * 新增一种历史表达（贸易网络、宗教传播、迁徙、城市演变、考古地层、文本流变……）
 * = 写一份 config schema + 一个组件 + 在本文件底部 register 一次。
 * 不改公共 schema，不动已有内容。
 */
import type { ZodType } from 'astro/zod';

export interface RendererDef<C = unknown> {
  /** 稳定 id，内容文件里引用的就是它。改名等于改内容，别改。 */
  id: string;
  /** 给编者看的说明：这个渲染器适合表达什么。 */
  purpose: string;
  /** config 的形状。构建时用它做第二遍校验。 */
  schema: ZodType<C>;
  /**
   * 这个渲染器是否依赖地理数据。
   * 用于检查：场景声明了 geoLayers 却没有任何一拍用得上，或反之。
   */
  usesGeo: boolean;
  /** 实现状态。registry 允许先登记后实现，便于规划。 */
  implemented: boolean;
}

const registry = new Map<string, RendererDef<any>>();

export function registerRenderer<C>(def: RendererDef<C>): void {
  if (registry.has(def.id)) {
    throw new Error(`renderer id 重复注册：${def.id}`);
  }
  registry.set(def.id, def);
}

export function getRenderer(id: string): RendererDef | undefined {
  return registry.get(id);
}

export function listRenderers(): RendererDef[] {
  return [...registry.values()];
}

export interface VisualValidationIssue {
  sceneId: string;
  beatId: string;
  renderer: string;
  message: string;
}

/**
 * 第二遍校验：把 beat.visual.config 交给对应 renderer 的 schema。
 *
 * 公共 schema 过不了这一关 —— 它根本不知道 config 该长什么样，
 * 这正是"不假定所有历史场景只能归入当前三类"的代价与好处。
 */
export function validateVisual(
  sceneId: string,
  beatId: string,
  visual: { renderer: string; config: Record<string, unknown> },
): VisualValidationIssue[] {
  const def = registry.get(visual.renderer);
  if (!def) {
    const known = [...registry.keys()].join(', ') || '（空）';
    return [{
      sceneId, beatId, renderer: visual.renderer,
      message: `未注册的 renderer "${visual.renderer}"。已注册：${known}`,
    }];
  }
  if (!def.implemented) {
    return [{
      sceneId, beatId, renderer: visual.renderer,
      message: `renderer "${visual.renderer}" 已登记但尚未实现，暂时不能在内容里使用。`,
    }];
  }
  const result = def.schema.safeParse(visual.config);
  if (result.success) return [];
  return result.error.issues.map((i) => ({
    sceneId, beatId, renderer: visual.renderer,
    message: `config.${i.path.join('.') || '(根)'}：${i.message}`,
  }));
}

/* ============================================================
   首轮注册
   ============================================================ */
import { mapNarrativeSchema } from './map-narrative/schema';
import { authorityTracksSchema } from './authority-tracks/schema';
import { procedureSequenceSchema } from './procedure-sequence/schema';
import { actorArraySchema } from './actor-array/schema';
import { structureCompareSchema } from './structure-compare/schema';

registerRenderer({
  id: 'map-narrative',
  purpose: '疆域、行军、路线、边界 —— 空间关系是论点本身时使用',
  schema: mapNarrativeSchema,
  usesGeo: true,
  implemented: true,
});

registerRenderer({
  id: 'authority-tracks',
  purpose:
    '一件事的若干侧面并不同步变化 —— 多条轨道共用一条时间轴，各自在不同时点改变。' +
    '卢比孔的 imperium 四维面板用它',
  schema: authorityTracksSchema,
  usesGeo: false,
  implemented: true,
});

registerRenderer({
  id: 'procedure-sequence',
  purpose: '一套制度程序被依次走完或依次绕过 —— 卢比孔拍 3 用它',
  schema: procedureSequenceSchema,
  usesGeo: false,
  implemented: true,
});

registerRenderer({
  id: 'actor-array',
  purpose: '人物集合、权力构成、群体成分变化 —— 关系与结构，不是地理',
  schema: actorArraySchema,
  usesGeo: false,
  implemented: false, // M5 扩展验证时实现
});

registerRenderer({
  id: 'structure-compare',
  purpose: '制度、机构、前后对照 —— 表象与实质的差异',
  schema: structureCompareSchema,
  usesGeo: false,
  implemented: false, // M5 之后
});
