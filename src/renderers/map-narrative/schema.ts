import { z } from 'astro/zod';
import { i18n, geoAccuracy, imageAsset } from '../../lib/schema';

/**
 * map-narrative —— 空间关系是论点本身时使用。
 *
 * 一拍可以只有一个画面（常见），也可以是一串**媒介转换**（拍 4）。
 * 媒介转换刻意做成显式的 steps，而不是一个连续缩放参数：
 * 底图数据支撑不到的尺度就不该放大，硬放大是在制造虚假精确。
 */

/** 镜头：中心经纬度 + 经度跨度。跨度越小越近。 */
const camera = z.object({
  lon: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
  /** 经度跨度（度）。下限 0.5° ≈ 50km —— 再近就超出底图数据能支撑的精度。 */
  span: z.number().min(0.5).max(360),
});

/**
 * 媒介类型。切换媒介时界面呈现方式必须跟着变，
 * 让读者知道自己在看的东西性质变了。
 */
const medium = z.enum([
  'basemap',    // 现代测绘底图
  'schematic',  // 示意图（虚线 + 羽化边缘绘制）
  'photograph', // 照片：不是地图，也不是古代地理证据
]);

const step = z.object({
  id: z.string(),
  medium,
  accuracy: geoAccuracy,
  camera: camera.optional(),
  /** 本步显示哪些地理图层（引用 scene.geoLayers 里的 id） */
  layers: z.array(z.string()).default([]),
  /** medium 为 photograph 时必填 */
  image: imageAsset.optional(),
  /**
   * 界面上必须显示的标注。
   * 非 survey 的一律必填 —— 示意内容不能与确证地理事实长得一样。
   */
  caption: i18n.optional(),
}).superRefine((s, ctx) => {
  if (s.medium === 'photograph' && !s.image) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom, path: ['image'],
      message: `step "${s.id}" 的 medium 是 photograph，必须提供 image（含授权信息）。`,
    });
  }
  if (s.medium !== 'photograph' && s.layers.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom, path: ['layers'],
      message: `step "${s.id}" 是地图，必须至少引用一个 geoLayer。`,
    });
  }
  if (s.accuracy !== 'survey' && !s.caption) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom, path: ['caption'],
      message:
        `step "${s.id}" 的 accuracy 是 ${s.accuracy}，必须填 caption 说明其估计性质。`,
    });
  }
});

/** 地点标记。地点本身在 entities 里定义，这里只引用并指定强调级别。 */
const marker = z.object({
  place: z.string(),                                  // 历史对象 id
  emphasis: z.enum(['normal', 'key', 'muted']).default('normal'),
  /** 位置本身有争议时标记出来，绘制上要与确定地点区分 */
  positionDisputed: z.boolean().default(false),
});

/** 行军 / 航路。side 是叙事分组，不预设颜色语义。 */
const route = z.object({
  id: z.string(),
  side: z.string(),
  points: z.array(z.tuple([z.number(), z.number()])).min(2),
  accuracy: geoAccuracy.default('schematic'),
  label: i18n.optional(),
});

export const mapNarrativeSchema = z.object({
  steps: z.array(step).min(1),
  markers: z.array(marker).default([]),
  routes: z.array(route).default([]),
  /**
   * 叠加的制度授权带：某支指挥权依据哪条法律、期限到何时。
   * 拍 1 的默认视图靠它回答"这些军队的指挥权是谁给的"。
   */
  authorityBands: z.array(z.object({
    id: z.string(),
    holder: z.string(),                 // 历史对象 id（人物）
    label: i18n,
    basis: z.string(),                  // 法律依据，如 lex-vatinia
    expiresLabel: i18n.optional(),
    places: z.array(z.string()).default([]),
  })).default([]),
}).strict();

export type MapNarrativeConfig = z.infer<typeof mapNarrativeSchema>;
