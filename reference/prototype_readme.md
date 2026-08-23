# 从卢比孔到亚克兴 — 滚动叙事原型

罗马共和国崩塌（前49–前31）的交互式历史叙事页面原型。单文件、零依赖。

## 文件

- `index.html` — 完整可离线运行的页面。双击用浏览器打开即可。
- `project_brief.md` — 项目整体定位、内容边界、设计原则与待确认问题。

## 运行说明

直接双击打开就能用。唯一的联网依赖是 Google Fonts（Cinzel / Spectral / Noto Serif SC / IBM Plex Mono）；
断网时会回退到系统衬线字体，功能不受影响，只是字体观感不同。
若要完全离线保真，把这 4 个字体下成 woff2、改成本地 `@font-face` 即可。

## 代码结构

整个页面是一个文件，内部分三段，都在 `index.html` 里：

```
<style>   1. 设计令牌（:root 里的颜色变量）+ 版面
<div>     2. HTML 骨架：顶栏 / 左叙事栏 / 右侧粘性地图
<script>  3. ① 地图数据与投影
             ② 场景数据 SCENES
             ③ 渲染与滚动联动
```

### ① 地图（`NORTH` / `AFRICA` / `ISLANDS`）

海岸线以 `[经度, 纬度]` 数组存储，运行时通过 `project()` 投影为 SVG 坐标：

```js
const project = (lon, lat) => [ (lon + 10) * 20, (50 - lat) * 20 ];
```

等距圆柱投影（Plate Carrée），最简单的一种。坐标是手写的示意海岸线，**不是精确地理数据**。
若要精确，换成 Natural Earth 的 GeoJSON + d3-geo 的投影即可，`project()` 是唯一需要替换的函数。

### ② 场景数据（`SCENES`）

**这是整个项目最重要的设计。** 内容与渲染引擎完全分离——
每个场景是一个纯数据对象，引擎不认识罗马史，只认识这个结构：

```js
{
  id: 's2',
  t: 0.06,                       // 在顶部时间轴上的位置 0~1
  cap: 'IAN. XI · MMCIL A.V.C.', // 地图右下角的小字
  view: { lon: 13.0, lat: 43.2, span: 11 },  // 镜头：中心经纬度 + 经度跨度（越小越近）
  places: ['ravenna','rubicon','ariminum','rome'],  // 本屏显示哪些地点
  key:     ['rubicon'],          // 高亮为金色的地点
  battles: [],                   // 画成空心红环的战役点
  routes: [{ side:'caesar', pts:[[12.20,44.42], ...] }],  // 行军路线
  zh: { year, title, body:[...], note:{t,c} },   // 中文文案
  en: { year, title, body:[...], note:{t,c} }    // 英文文案
}
```

加一屏叙事 = 往数组里加一个对象，不需要碰任何渲染代码。
加一章 = 把 `SCENES` 拆成独立的 `chapters/rome-republic.json` 之类的文件再 fetch 进来。

地点在 `PLACES` 里集中定义（经纬度 + 中英文名），场景里只写 id 引用。

### ③ 渲染与联动

| 机制 | 实现 |
|---|---|
| 滚动触发 | `IntersectionObserver`，`rootMargin: '-45% 0px -45% 0px'` —— 元素穿过视口中线时激活 |
| 地图镜头 | 补间 SVG `viewBox`（`goToView()`），非 CSS transform。用 rAF 手写缓动，因为 viewBox 不能被 CSS transition |
| 视野自适应 | `applyView()` 读取容器实际宽高比，据此算 viewBox 高度，所以任何屏幕比例都填满不留黑边 |
| 标记大小恒定 | 缩放时给每个标记反向 `scale(span / BASE_SPAN)`，保证屏幕上视觉大小不变 |
| 路线动画 | `stroke-dasharray` / `stroke-dashoffset` 配合 `getTotalLength()`，做"逐段画出" |
| 双语 | `data-i18n` 属性 + `renderText()` 重渲染。地图标签也一起切 |

## 已知取舍（原型阶段刻意保留）

1. **海岸线是手绘示意**，不是真实边界，也没有古代行省/势力范围的面数据。
2. **单文件**。真做成书需要拆成：引擎 / 章节数据 / 样式三部分。
3. **无图片**。真实版本需要接入公有领域素材（Wikimedia Commons、大英博物馆开放授权、
   AWMC 古代世界地图数据）。
4. **无路由**。目前只有一章，多章之后需要 URL 能定位到具体章节和场景。
5. **视觉单主题**（深色夜航海图），不跟随系统深浅色。

## 内容说明

文案基于凯撒《内战记》、苏埃托尼乌斯、普鲁塔克、阿庇安等古典史料的通行叙述，
每屏的"注释"栏专门用于标注史料本身的不确定性（数字来源、后世附会、胜利者视角）。
这是原型内容，正式出版前需要逐条核对并补充引注。
