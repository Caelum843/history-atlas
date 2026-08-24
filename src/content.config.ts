import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { civilization, civilizationEra, knowledgeChapter, scene, work, sourceEntity, worldNode } from './lib/schema';
import { z } from 'astro/zod';
import { i18n } from './lib/schema';

/**
 * 内容集合。
 *
 * 注意这里引用的 schema 只覆盖**公共结构**——
 * 场景视觉（beat.visual.config）的第二遍校验在 src/lib/validate.ts 里做，
 * 因为它需要 renderer registry，而 registry 不属于内容契约。
 */

const works = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/works' }),
  schema: work,
});

const scenes = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/scenes' }),
  schema: scene,
});

const sources = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/sources' }),
  schema: sourceEntity,
});

/** 历史对象：人物、地点、政权、事件、制度、文物。场景只引用 id。 */
const entities = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/entities' }),
  schema: z.object({
    kind: z.enum(['person', 'place', 'polity', 'event', 'institution', 'artefact']),
    name: i18n,
    /** 古典原名，如 ROMA、RVBICO */
    nameLatin: z.string().optional(),
    summary: i18n.optional(),
    /** kind 为 place 时的坐标 */
    lon: z.number().optional(),
    lat: z.number().optional(),
    /** 位置本身存在争议 —— 绘制上必须与确定地点区分 */
    positionDisputed: z.boolean().default(false),
    note: i18n.optional(),
  }).superRefine((e, ctx) => {
    if (e.kind === 'place' && (e.lon === undefined || e.lat === undefined) && !e.positionDisputed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom, path: ['lon'],
        message: `地点 "${e.name.zh}" 缺少坐标。若因位置不可考而无坐标，请显式设 positionDisputed: true。`,
      });
    }
  }),
});

/** 世界层节点。与作品/论断结构并列，互不侵入。 */
const world = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/world' }),
  schema: worldNode,
});

const civilizations = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/civilizations' }),
  schema: civilization,
});

const eras = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/eras' }),
  schema: civilizationEra,
});

const chapters = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/chapters' }),
  schema: knowledgeChapter,
});

export const collections = { works, scenes, sources, entities, world, civilizations, eras, chapters };
