/**
 * 全站公共内容契约。
 *
 * 这里只定义 plan_v1.md §2.1 列出的八项稳定结构：
 *   时间 / 历史对象 / 论断 / 来源 / 图像与授权 / 地理信息及精度 / 不确定性 / 注释与分层阅读
 *
 * 刻意不做的事：**不枚举场景视觉类型**。
 * beat.visual 只校验 `renderer` 是字符串、`config` 是对象；
 * config 的具体形状由该 renderer 自己的 schema 在第二遍校验（见 src/renderers/registry.ts）。
 * 新增一种历史表达 = 注册一个 renderer，不触碰本文件。
 */
import { z } from 'astro/zod';

/* ---------- 多语言 ---------- */
// 中文为主语言（decisions 决策 5），英文字段预留，补英文不用改架构。
export const i18n = z.object({
  zh: z.string(),
  en: z.string().optional(),
});
export type I18n = z.infer<typeof i18n>;

/* ---------- 出版状态 ---------- */
// 必须在数据与界面上都可见：读者不能把实验样章误认为完整作品。
export const publicationStatus = z.enum([
  'sample',    // 实验样章 —— 为验证方法而做，不代表完整叙述
  'draft',     // 草稿 —— 内容未完成或未核实
  'chapter',   // 完整章节
  'published', // 已发布作品
]);
export type PublicationStatus = z.infer<typeof publicationStatus>;

/* ---------- 时间 ---------- */
export const timePrecision = z.enum(['day', 'month', 'year', 'range', 'unknown']);

export const historicalTime = z.object({
  label: i18n,
  /** 排序键：儒略历年份，公元前为负数。用于跨作品的时间轴对齐。 */
  sortKey: z.number(),
  precision: timePrecision,
  /** 纪年体系：史料原文使用的纪年，如 a.u.c.、执政官纪年、前儒略历 */
  reckoning: z.string().optional(),
  /** 换算或系年上的不确定性，如前儒略历与季节脱节 */
  note: i18n.optional(),
});

/* ---------- 来源（独立实体） ---------- */
export const sourceKind = z.enum([
  'ancient',        // 古典文献
  'modern',         // 现代研究
  'epigraphic',     // 铭文
  'numismatic',     // 钱币
  'archaeological', // 考古
  'documentary',    // 文书
]);

export const sourceEntity = z.object({
  kind: sourceKind,
  author: z.object({
    name: z.string(),
    nameZh: z.string().optional(),
    floruit: z.string().optional(),
  }).optional(),
  title: z.object({
    original: z.string().optional(),
    zh: z.string(),
    en: z.string().optional(),
  }),
  /** 该作品的标准定位格式，如 "卷.章"。用于提示编者怎么写 locus。 */
  locusScheme: z.string().optional(),
  composed: z.object({
    label: z.string(),
    sortKey: z.number().optional(),
    note: i18n.optional(),
  }).optional(),
  language: z.string().optional(),
  edition: z.object({
    text: z.string().optional(),
    translator: z.string().optional(),
    publisher: z.string().optional(),
    year: z.number().optional(),
    isbn: z.string().optional(),
  }).optional(),
  url: z.string().url().optional(),
  accessed: z.string().optional(),
  /** 立场：如"当事人自述，有夸大对手规模的动机" */
  stance: i18n.optional(),
  /** 使用限制：如"仅存节本""经后世转录" */
  limits: i18n.optional(),
});

/* ---------- 论断 ---------- */
export const evidenceStatus = z.enum([
  'attested', // 有直接史料支持
  'inferred', // 由证据推出，非直接记载
  'disputed', // 学界有分歧
  'legend',   // 后世附会
]);

export const citationRelation = z.enum([
  'supports',        // 支持
  'contradicts',     // 反对
  'contextualises',  // 提供背景
  'later-tradition', // 后世转述
]);

export const citation = z.object({
  source: z.string(),               // 来源实体 id
  locus: z.string().optional(),     // 篇章 / 页码定位
  relation: citationRelation,
  note: i18n.optional(),
});

export const claim = z.object({
  id: z.string(),
  text: i18n,
  status: evidenceStatus,
  citations: z.array(citation).default([]),
  /** 替代解释。status 为 disputed 时必填 —— 见下方 superRefine。 */
  alternatives: z.array(z.object({
    text: i18n,
    citations: z.array(citation).default([]),
  })).optional(),
  uncertainty: i18n.optional(),
}).superRefine((c, ctx) => {
  if (c.status === 'disputed' && (!c.alternatives || c.alternatives.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['alternatives'],
      message:
        `论断 "${c.id}" 的 status 是 disputed，必须提供 alternatives（替代解释）。` +
        `有争议的判断不能只呈现一种说法。`,
    });
  }
});

/* ---------- 图像与授权 ---------- */
export const imageKind = z.enum([
  'artefact',       // 文物
  'site',           // 遗址 / 实景
  'map',            // 地图
  'manuscript',     // 抄本
  'reconstruction', // 复原图 —— 界面强制标记"非原始史料"
  'ai-assisted',    // AI 辅助图像 —— 界面强制标记"非原始史料"
]);

/** 这两类不是史料，界面上必须带不可关闭的标记。 */
export const NON_PRIMARY_IMAGE_KINDS: ReadonlySet<string> = new Set([
  'reconstruction',
  'ai-assisted',
]);

export const imageAsset = z.object({
  file: z.string(),
  kind: imageKind,
  alt: i18n,                        // 必填：无 alt 不给发布
  caption: i18n,
  creator: z.string().optional(),
  holder: z.string().optional(),
  license: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  sourceUrl: z.string().url(),
  accessed: z.string(),
  processing: z.array(z.enum([
    'cropped', 'colour-adjusted', 'background-removed', 'upscaled', 'composited',
  ])).optional(),
});

/* ---------- 地理信息及精度 ---------- */
export const geoAccuracy = z.enum([
  'survey',    // 现代测绘数据
  'scholarly', // 学界重建，有争议但有依据
  'schematic', // 示意，不代表真实边界
  'disputed',  // 位置或范围本身存在争议
]);

/** schematic / disputed 必须在绘制上与实测数据可区分（虚线、羽化边缘等）。 */
export const NON_SURVEY_ACCURACY: ReadonlySet<string> = new Set(['schematic', 'disputed']);

export const geoLayer = z.object({
  id: z.string(),
  data: z.string(),                 // TopoJSON 路径
  validFor: z.string(),             // 适用年代
  accuracy: geoAccuracy,
  label: i18n.optional(),
  note: i18n.optional(),
}).superRefine((l, ctx) => {
  if (NON_SURVEY_ACCURACY.has(l.accuracy) && !l.note) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['note'],
      message:
        `图层 "${l.id}" 的 accuracy 是 ${l.accuracy}，必须填 note 说明其估计性质。` +
        `示意内容不能与确证地理事实长得一样。`,
    });
  }
});

/* ---------- 注释与分层阅读 ---------- */
export const readingLayer = z.object({
  id: z.string(),
  title: i18n,
  body: z.array(i18n),
  claims: z.array(z.string()).default([]),   // 引用 beat.claims 里的 id
  images: z.array(imageAsset).default([]),
  entities: z.array(z.string()).default([]), // 引用历史对象 id
});

/* ---------- 视觉层：只认 renderer id，不认类型 ---------- */
/**
 * 公共 schema 到此为止。
 * config 的形状由 renderer 自己声明，第二遍校验在 registry 里做。
 */
export const beatVisual = z.object({
  renderer: z.string(),
  config: z.record(z.string(), z.unknown()).default({}),
});

/* ---------- 拍 ---------- */
export const beat = z.object({
  id: z.string(),
  title: i18n,
  body: z.array(i18n).default([]),
  time: historicalTime,
  claims: z.array(claim).default([]),
  visual: beatVisual,
  layers: z.array(readingLayer).default([]),
});

/* ---------- 场景 ---------- */
export const scene = z.object({
  title: i18n,
  status: publicationStatus,
  /** 所属作品与章节。章节可缺 —— 实验样章可能还没归章。 */
  work: z.string(),
  chapter: z.string().optional(),
  order: z.number().default(0),
  summary: i18n,
  /** 这一场要让读者理解什么。写给编者看的，不出现在界面上。 */
  intent: z.string().optional(),
  geoLayers: z.array(geoLayer).default([]),
  beats: z.array(beat).min(1),
});

/* ---------- 作品 ---------- */
export const work = z.object({
  title: i18n,
  status: publicationStatus,
  /** 时间跨度，用于入口的时间二级选择 */
  span: z.object({
    label: i18n,
    fromSortKey: z.number(),
    toSortKey: z.number(),
  }),
  /** 地理范围，用于入口的地图区域选择 */
  regions: z.array(z.string()).default([]),
  summary: i18n,
  /**
   * 出版状态为 sample 时，界面必须显示的提示语。
   * 防止读者把几个实验样章误认为完整作品。
   */
  sampleNotice: i18n.optional(),
}).superRefine((w, ctx) => {
  if (w.status === 'sample' && !w.sampleNotice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['sampleNotice'],
      message:
        `作品 "${w.title.zh}" 的 status 是 sample，必须填 sampleNotice。` +
        `读者不能把实验样章误认为对这段历史的完整讲述。`,
    });
  }
});

/* ---------- 文明与时代主干 ---------- */

/**
 * 文明总览不是一篇作品，而是许多时代卷共同挂载的时间主干。
 * 起讫只是当前编辑范围，不声称文明存在一个无争议的绝对边界。
 */
export const civilization = z.object({
  title: i18n,
  subtitle: i18n,
  span: z.object({
    label: i18n,
    fromSortKey: z.number(),
    toSortKey: z.number(),
  }),
  summary: i18n,
  scopeNote: i18n,
});

export const eraAvailability = z.enum(['open', 'sample', 'planned']);

/** 一个时代卷：时间主干上的语义区段，而非简单的世纪切片。 */
export const civilizationEra = z.object({
  civilization: z.string(),
  title: i18n,
  shortTitle: i18n,
  order: z.number(),
  availability: eraAvailability,
  span: z.object({
    label: i18n,
    fromSortKey: z.number(),
    toSortKey: z.number(),
  }),
  /** 这一时代最值得理解的结构变化。 */
  thesis: i18n,
  summary: i18n,
  transition: i18n.optional(),
  entry: z.string().optional(),
  anchors: z.array(i18n).default([]),
}).superRefine((era, ctx) => {
  if (era.availability === 'planned' && era.entry) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['entry'],
      message: `规划中的时代卷“${era.title.zh}”不能提供可进入路由。`,
    });
  }
  if (era.availability !== 'planned' && !era.entry) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['entry'],
      message: `已开放或实验中的时代卷“${era.title.zh}”必须提供入口。`,
    });
  }
});

/* ---------- 知识章节 ---------- */

/**
 * 场景负责视觉与证据，章节负责读者真正读到的论证顺序。
 * 二者分开后，同一套视觉舞台可以承载比“三拍演示”更完整的知识叙事。
 */
export const chapterSegment = z.object({
  id: z.string(),
  /** 对应故事舞台的幕；同一幕可以承载多个知识段落。 */
  act: z.number().int().min(0).max(2),
  role: z.enum(['question', 'context', 'mechanism', 'sequence', 'event', 'consequence', 'sources', 'recap']),
  eyebrow: i18n,
  title: i18n,
  body: z.array(i18n).min(1),
  keyPoint: i18n.optional(),
  entities: z.array(z.string()).default([]),
  claimRefs: z.array(z.string()).default([]),
});

export const knowledgeChapter = z.object({
  scene: z.string(),
  question: i18n,
  answer: i18n,
  segments: z.array(chapterSegment).min(5),
});

/* ============================================================
   世界层（M1.5）
   与上面的作品/论断结构**并列**，互不侵入。
   这不是最终的历史知识图谱，只用于搭建世界节点、对象卡片、
   相关故事、页面间跳转与空间布局。以后再替换为严谨的关系模型。
   ============================================================ */

/** 时间上下文。本阶段只定义，不使用 —— 时间系统不得阻塞体验框架。 */
export const timeContext = z.object({
  from: z.number().optional(),
  to: z.number().optional(),
  label: i18n.optional(),
});
export type TimeContext = z.infer<typeof timeContext>;

/** 最小关系结构。本阶段只定义，不驱动渲染。 */
export const relationship = z.object({
  from: z.string(),
  to: z.string(),
  type: z.string(),
  label: i18n,
  timeContext: timeContext.optional(),
});

export const worldNodeType = z.enum([
  'region', 'person', 'place', 'event', 'institution', 'artefact', 'story',
]);

export const worldNode = z.object({
  type: worldNodeType,
  title: i18n,
  summary: i18n.optional(),
  /** 视觉提示，交给该层的渲染决定怎么用 */
  visual: z.string().optional(),

  /**
   * 真实经纬度。只有确实占据地理位置的对象才有。
   * 人物、制度、文献没有 —— 把它们钉到坐标上是范畴错误。
   */
  lon: z.number().optional(),
  lat: z.number().optional(),
  /** 位置存在争议时为 true，绘制上必须与确定位置区分 */
  positionDisputed: z.boolean().default(false),

  /**
   * 布局位置（0–1 的相对坐标）。给没有地理位置的对象用。
   * 与 lon/lat 互斥：一个对象要么在地上，要么在构图里。
   */
  position: z.object({ x: z.number(), y: z.number() }).optional(),

  /** 关联对象 id。互链的最低要求见下方 superRefine。 */
  related: z.array(z.string()).default([]),
  /** 可进入时的目标路由。没有则为"可感知不可进入" */
  entry: z.string().optional(),
  /** 未开放但确在规划内 —— 必须为真实计划，不得用装饰点伪造规模 */
  planned: z.boolean().default(false),

  timeContext: timeContext.optional(),
}).superRefine((n, ctx) => {
  const hasGeo = n.lon !== undefined && n.lat !== undefined;
  if (hasGeo && n.position) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom, path: ['position'],
      message: `"${n.title.zh}" 同时给了经纬度和布局坐标。一个对象要么在地上，要么在构图里，不能都要。`,
    });
  }
  if (['person', 'institution'].includes(n.type) && hasGeo) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom, path: ['lon'],
      message: `"${n.title.zh}" 是 ${n.type}，不应有经纬度。人物与制度不是地点，钉在地图坐标上是范畴错误。`,
    });
  }
  // 「像一本书」靠的是永远撞不到叶子节点
  if (n.entry && n.related.length < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom, path: ['related'],
      message:
        `可进入对象 "${n.title.zh}" 只有 ${n.related.length} 条关联，至少需要 3 条。` +
        `每个核心对象都必须能继续通向别处，不能成为终点。`,
    });
  }
  if (n.planned && n.entry) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom, path: ['entry'],
      message: `"${n.title.zh}" 标为 planned（未开放）却给了 entry。未开放节点不能假装可点。`,
    });
  }
});
