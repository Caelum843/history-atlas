import { getCollection } from 'astro:content';
import { validateVisual, getRenderer, type VisualValidationIssue } from '../renderers/registry';

/**
 * 内容的第二遍校验 —— 公共 schema 管不到的部分。
 *
 * 三类检查：
 *   ① beat.visual.config 交给对应 renderer 的 schema
 *   ② 跨集合引用是否存在（论断引用的来源、场景引用的作品、地图引用的地点与图层）
 *   ③ 出版状态对应的完整度要求（chapter 及以上必须有出处）
 *
 * 在页面构建时调用并抛错，让问题变成构建失败而不是上线后的错误内容。
 */

export interface ContentIssue {
  where: string;
  message: string;
}

export async function validateContent(): Promise<ContentIssue[]> {
  const [scenes, works, sources, entities, chapters, world] = await Promise.all([
    getCollection('scenes'),
    getCollection('works'),
    getCollection('sources'),
    getCollection('entities'),
    getCollection('chapters'),
    getCollection('world'),
  ]);

  const workIds = new Set(works.map((w) => w.id));
  const sourceIds = new Set(sources.map((s) => s.id));
  const entityIds = new Set(entities.map((e) => e.id));
  const worldIds = new Set(world.map((node) => node.id));
  const issues: ContentIssue[] = [];

  for (const s of scenes) {
    const d = s.data;
    const layerIds = new Set(d.geoLayers.map((l) => l.id));

    if (!workIds.has(d.work)) {
      issues.push({ where: `scene/${s.id}`, message: `引用了不存在的作品 "${d.work}"` });
    }

    // 出版状态越高，要求越严。sample / draft 允许出处暂缺。
    const needsCitations = d.status === 'chapter' || d.status === 'published';

    for (const b of d.beats) {
      const at = `scene/${s.id}#${b.id}`;

      // ① 视觉配置
      const visualIssues: VisualValidationIssue[] = validateVisual(s.id, b.id, {
        renderer: b.visual.renderer,
        config: b.visual.config,
      });
      for (const v of visualIssues) issues.push({ where: at, message: v.message });

      // renderer 声明用地理数据，场景却没给图层
      const def = getRenderer(b.visual.renderer);
      if (def?.usesGeo && layerIds.size === 0) {
        issues.push({
          where: at,
          message: `renderer "${def.id}" 需要地理图层，但场景 geoLayers 为空。`,
        });
      }

      // ② 引用完整性
      for (const c of b.claims) {
        for (const cite of c.citations) {
          if (!sourceIds.has(cite.source)) {
            issues.push({
              where: `${at} claim/${c.id}`,
              message: `引用了不存在的来源 "${cite.source}"`,
            });
          }
        }
        // ③ 完整度
        if (needsCitations && c.citations.length === 0) {
          issues.push({
            where: `${at} claim/${c.id}`,
            message:
              `场景状态为 ${d.status}，论断必须有 citations。` +
              `（sample / draft 阶段允许暂缺）`,
          });
        }
      }

      // 地图标记引用的地点
      const cfg = b.visual.config as Record<string, unknown>;
      const markers = Array.isArray(cfg.markers) ? cfg.markers : [];
      for (const m of markers as { place?: string }[]) {
        if (m.place && !entityIds.has(m.place)) {
          issues.push({ where: at, message: `地图标记引用了不存在的地点 "${m.place}"` });
        }
      }
      const steps = Array.isArray(cfg.steps) ? cfg.steps : [];
      for (const st of steps as { id?: string; layers?: string[] }[]) {
        for (const l of st.layers ?? []) {
          if (!layerIds.has(l)) {
            issues.push({
              where: at,
              message: `step "${st.id}" 引用了场景中不存在的图层 "${l}"`,
            });
          }
        }
      }
    }
  }

  const scenesById = new Map(scenes.map((scene) => [scene.id, scene]));
  for (const chapter of chapters) {
    const at = `chapter/${chapter.id}`;
    const linkedScene = scenesById.get(chapter.data.scene);
    if (!linkedScene) {
      issues.push({ where: at, message: `引用了不存在的场景 "${chapter.data.scene}"` });
      continue;
    }

    const claimIds = new Set(linkedScene.data.beats.flatMap((beat) => beat.claims.map((claim) => claim.id)));
    const segmentIds = new Set<string>();
    let previousAct = -1;
    for (const segment of chapter.data.segments) {
      const segmentAt = `${at}#${segment.id}`;
      if (segmentIds.has(segment.id)) {
        issues.push({ where: segmentAt, message: `章节段落 id 重复` });
      }
      segmentIds.add(segment.id);
      if (segment.act < previousAct) {
        issues.push({ where: segmentAt, message: `幕编号从 ${previousAct} 倒退到 ${segment.act}，会破坏滚动切幕顺序` });
      }
      previousAct = segment.act;
      for (const claimRef of segment.claimRefs) {
        if (!claimIds.has(claimRef)) {
          issues.push({ where: segmentAt, message: `引用了场景中不存在的论断 "${claimRef}"` });
        }
      }
      for (const entityRef of segment.entities) {
        if (!worldIds.has(entityRef)) {
          issues.push({ where: segmentAt, message: `引用了世界层中不存在的对象 "${entityRef}"` });
        }
      }
    }
  }

  return issues;
}

/** 构建时调用：有问题就让构建失败。 */
export async function assertContentValid(): Promise<void> {
  const issues = await validateContent();
  if (issues.length === 0) return;
  const lines = issues.map((i) => `  · [${i.where}] ${i.message}`).join('\n');
  throw new Error(`内容校验未通过（${issues.length} 项）：\n${lines}`);
}
