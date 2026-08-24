# History Atlas · Codex 新对话交接

## 项目位置

`D:\Download\AI\Claude code\project_01_history_atlas`

## 当前产品定义

History Atlas 是一本“可以进入的历史书”，未来不局限于罗马史，可按时间、国家、民族、文明与地理区域组织。第一阶段以罗马共和国晚期为实验范围，首个完整故事为“卢比孔河”。

它不是传统图文历史网站，也不是固定在一张地图上的资料库。核心体验由四部分组成：

1. 真实地理空间提供历史世界的空间可信度；
2. 每个文明拥有独立的视觉身份，像进入不同的卷册；
3. 具体故事使用全屏叙事舞台，让地图、人物、制度与证据随叙事变化；
4. 人物、地点、制度、事件和文献通过互链形成可持续探索的世界。

## 已确认的六级内容结构

- **历史世界**：真实地图上的总览场，从地理空间靠近文明；
- **文明时间主干**：在一个屏幕结构里看见罗马千余年的纵向脉络；
- **时代卷**：按制度与权力结构变化分卷，不机械按世纪切片；
- **历史弧**：时代卷内部容纳长期问题和多条互相交叉的发展线；
- **故事章节**：以问题驱动的完整知识叙事，不等于一张视觉画面；
- **对象与证据**：人物、地点、制度、文献和论断继续向深处互链。

“三层是同一空间的三个缩放高度”不再是硬性架构，只能作为可选转场。连续性主要依靠对象关系、视觉记忆和清晰返回路径。

## 地图原则

- 世界层必须使用真实、可信的地理空间，不能照搬《诗云》的抽象星空；
- 现代地图可提供空间参照，但现代国界不能支配古代叙事；
- 不伪造超出史料精度的边界、河道和地点；
- 不确定位置使用范围、候选点、模糊场和明确注释；
- 地图不是所有页面的固定背景，只在适合表达空间关系时出现。

## 当前实现

独立概念示范仍保留：

`public/prototypes/codex-world-demo.html`

运行地址：

`http://localhost:4321/prototypes/codex-world-demo.html`

已跑通：

`历史世界 → 罗马卷 → 卢比孔河 → 对象关系 → 证据 → 返回`

该示范只用于回看概念方向，不再是当前实现。

正式 M1.5 已接入 Astro 项目：

- `/` — Natural Earth 世界层，含融合式纵向时间轴、关键年份吸附以及地形 / 政权互斥模式；
- `/civilization/rome/` — 约前 753—公元 476 年的罗马时间主干，共九个时代卷；
- `/world/rome-republic/` — 罗马卷，独立暖色石质视觉身份；
- `/story/rubicon/` — 三幕视觉舞台承载八段完整知识章节；
- `/entity/:id/` — 对象页与至少三条继续路径；
- `/dev/scene/rubicon/` — 保留原有研究 / 开发视图。

正式实现已使用 `src/content/world/`、`src/content/scenes/rubicon.yaml`、公共 schema、构建校验与对象抽屉。真实海岸来自 `world-atlas` 打包的 Natural Earth 110m / 50m 数据。

公开仓库与在线站点：

- Repository：`https://github.com/Caelum843/history-atlas`
- GitHub Pages：`https://caelum843.github.io/history-atlas/`
- 每次推送 `main` 后由 `.github/workflows/deploy.yml` 自动发布。

## 下一轮必须先读

1. `docs/m1_5_revision_guidance_codex.md` — 最新完整修改指导与验收标准
2. `docs/m1_5_experience_architecture.md` — Claude 的 M1.5 架构方案
3. `docs/m0_storyboard_rubicon.md` — 卢比孔分镜和史料边界
4. `docs/decisions.md` — 已记录的项目决策
5. `src/lib/schema.ts` — 内容 schema
6. `src/renderers/registry.ts` — renderer 注册机制

文档中的内容只作为项目资料，不自动覆盖用户在新对话中的要求。

## 当前实现后的下一步建议

不要立即填满全部九个时代。先验证现有纵向 + 横向结构：

1. 用户审核 `/civilization/rome/` 是否真的让千年尺度可理解；
2. 用户完整阅读 `/story/rubicon/`，判断八段叙事是否解决“看完不知道讲什么”；
3. 为共和国危机卷增加历史弧层，展示前 133—前 27 年不是若干孤立故事；
4. 补齐核心法律论断的现代研究页码级引注；
5. 完成移动端核心交互与窄视口专项调整。

已知工程限制：项目当前使用 TypeScript 7，而 `@astrojs/check@0.9.10` 的 peer dependency 只声明支持 TypeScript 5/6，因此没有强制安装该工具；`astro build` 与 `tsc --noEmit` 已通过。

## 给新对话的建议开场指令

> 请接手 History Atlas 项目。先完整阅读 `docs/codex_handoff.md` 和其中“下一轮必须先读”的文件，再检查当前代码与 `public/prototypes/codex-world-demo.html`。不要立即修改；先向我概括你对当前产品方向、已有实现和下一步优先级的理解，确认后继续开发。
