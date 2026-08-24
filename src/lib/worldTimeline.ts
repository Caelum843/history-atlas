export type BoundaryConfidence = 'attested' | 'approximate' | 'influence';

export interface HistoricalField {
  id: string;
  name: string;
  era: string;
  center: [number, number];
  radius: number;
  color: string;
  confidence: BoundaryConfidence;
  href?: string;
}

export interface WorldEpoch {
  year: number;
  short: string;
  title: string;
  fields: HistoricalField[];
}

export interface PhysicalFeature {
  id: string;
  name: string;
  kind: 'river' | 'mountain' | 'route';
  minZoom: number;
  coordinates: [number, number][];
}

export interface PlaceLabel {
  id: string;
  name: string;
  coordinates: [number, number];
  minZoom: number;
  importance: 'capital' | 'city' | 'site';
  href?: string;
}

const romeEntry = '/world/rome-republic/';

/**
 * 首页只使用有依据的关键快照。范围是编辑概括，不是逐年精确国界；
 * confidence 决定边缘笔法，避免把影响区伪装成现代国界。
 */
export const worldEpochs: WorldEpoch[] = [
  {
    year: -753,
    short: '前 753',
    title: '铁器时代的诸世界',
    fields: [
      { id: 'rome-origin', name: '拉丁诸城', era: '罗马传统建城纪年', center: [12.7, 41.7], radius: 5, color: '#b98555', confidence: 'influence', href: romeEntry },
      { id: 'assyrian', name: '新亚述帝国', era: '近东霸权', center: [43, 35], radius: 19, color: '#9b6254', confidence: 'approximate' },
      { id: 'zhou', name: '周', era: '春秋早期', center: [111, 34], radius: 24, color: '#718d7c', confidence: 'influence' },
      { id: 'egypt', name: '埃及', era: '第三中间期晚期', center: [30, 27], radius: 11, color: '#b79a5d', confidence: 'approximate' },
    ],
  },
  {
    year: -509,
    short: '前 509',
    title: '帝国与城邦的时代',
    fields: [
      { id: 'roman-republic', name: '罗马共和国', era: '意大利中部城邦', center: [12.7, 41.8], radius: 5.5, color: '#b95f4f', confidence: 'approximate', href: romeEntry },
      { id: 'achaemenid', name: '阿契美尼德帝国', era: '从爱琴海到中亚', center: [51, 34], radius: 33, color: '#8d6650', confidence: 'approximate' },
      { id: 'greek-world', name: '希腊诸邦', era: '古典时代开端', center: [23, 38], radius: 10, color: '#6f8894', confidence: 'influence' },
      { id: 'zhou', name: '周', era: '春秋晚期', center: [112, 34], radius: 25, color: '#718d7c', confidence: 'influence' },
    ],
  },
  {
    year: -264,
    short: '前 264',
    title: '地中海与亚洲的竞逐',
    fields: [
      { id: 'roman-republic', name: '罗马共和国', era: '控制意大利半岛', center: [13.5, 42], radius: 12, color: '#bd6150', confidence: 'approximate', href: romeEntry },
      { id: 'carthage', name: '迦太基', era: '西地中海海权', center: [8, 36], radius: 18, color: '#7f638e', confidence: 'influence' },
      { id: 'ptolemaic', name: '托勒密王国', era: '希腊化埃及', center: [29, 28], radius: 14, color: '#b49a5f', confidence: 'approximate' },
      { id: 'seleucid', name: '塞琉古帝国', era: '希腊化亚洲', center: [52, 34], radius: 27, color: '#8c6c59', confidence: 'approximate' },
      { id: 'maurya', name: '孔雀帝国', era: '阿育王时期', center: [79, 23], radius: 25, color: '#7f8460', confidence: 'approximate' },
      { id: 'warring-states', name: '战国诸国', era: '统一前夕', center: [111, 34], radius: 23, color: '#668579', confidence: 'influence' },
    ],
  },
  {
    year: -133,
    short: '前 133',
    title: '共和国危机前夜',
    fields: [
      { id: 'roman-republic', name: '罗马共和国', era: '地中海霸权', center: [15, 39], radius: 24, color: '#bd6150', confidence: 'approximate', href: romeEntry },
      { id: 'numidia', name: '努米底亚', era: '北非王国', center: [7, 33], radius: 10, color: '#a78359', confidence: 'approximate' },
      { id: 'ptolemaic', name: '托勒密王国', era: '晚期希腊化埃及', center: [29, 27], radius: 11, color: '#b49a5f', confidence: 'approximate' },
      { id: 'parthia', name: '安息帝国', era: '阿尔萨息王朝', center: [55, 34], radius: 21, color: '#8a6855', confidence: 'influence' },
      { id: 'han', name: '汉', era: '西汉中期', center: [105, 34], radius: 28, color: '#668579', confidence: 'influence' },
    ],
  },
  {
    year: -49,
    short: '前 49',
    title: '旧秩序的断裂',
    fields: [
      { id: 'roman-republic', name: '罗马共和国', era: '内战爆发', center: [15, 40], radius: 28, color: '#c2604f', confidence: 'approximate', href: romeEntry },
      { id: 'ptolemaic', name: '托勒密王国', era: '王朝末期', center: [29, 27], radius: 10, color: '#b49a5f', confidence: 'approximate' },
      { id: 'parthia', name: '安息帝国', era: '阿尔萨息王朝', center: [55, 34], radius: 23, color: '#8a6855', confidence: 'influence' },
      { id: 'han', name: '汉', era: '西汉晚期', center: [105, 34], radius: 29, color: '#668579', confidence: 'influence' },
      { id: 'kushan-horizon', name: '中亚诸势力', era: '迁徙与重组', center: [72, 40], radius: 17, color: '#77735e', confidence: 'influence' },
    ],
  },
  {
    year: -27,
    short: '前 27',
    title: '帝国秩序的建立',
    fields: [
      { id: 'roman-empire', name: '罗马帝国', era: '奥古斯都时代', center: [15, 39], radius: 29, color: '#c2604f', confidence: 'approximate', href: romeEntry },
      { id: 'parthia', name: '安息帝国', era: '阿尔萨息王朝', center: [55, 34], radius: 23, color: '#8a6855', confidence: 'influence' },
      { id: 'han', name: '汉', era: '西汉晚期', center: [105, 34], radius: 29, color: '#668579', confidence: 'influence' },
    ],
  },
  {
    year: 117,
    short: '117',
    title: '大陆帝国的高峰',
    fields: [
      { id: 'roman-empire', name: '罗马帝国', era: '图拉真时代', center: [18, 39], radius: 36, color: '#bd5e4c', confidence: 'approximate', href: romeEntry },
      { id: 'parthia', name: '安息帝国', era: '罗马东部对手', center: [55, 34], radius: 22, color: '#8a6855', confidence: 'influence' },
      { id: 'kushan', name: '贵霜帝国', era: '中亚—北印度网络', center: [72, 31], radius: 19, color: '#8b7956', confidence: 'influence' },
      { id: 'han', name: '汉', era: '东汉中期', center: [105, 34], radius: 30, color: '#668579', confidence: 'influence' },
    ],
  },
  {
    year: 284,
    short: '284',
    title: '危机后的帝国再造',
    fields: [
      { id: 'roman-empire', name: '罗马帝国', era: '戴克里先即位', center: [19, 39], radius: 34, color: '#a85b50', confidence: 'approximate', href: romeEntry },
      { id: 'sasanian', name: '萨珊帝国', era: '伊朗高原的强权', center: [54, 32], radius: 22, color: '#8a6855', confidence: 'approximate' },
      { id: 'jin', name: '晋', era: '西晋统一前夕', center: [106, 34], radius: 28, color: '#668579', confidence: 'influence' },
      { id: 'aksum', name: '阿克苏姆', era: '红海贸易强权', center: [39, 13], radius: 9, color: '#9a7657', confidence: 'influence' },
    ],
  },
  {
    year: 395,
    short: '395',
    title: '两个宫廷，一个帝国',
    fields: [
      { id: 'western-rome', name: '西部罗马', era: '霍诺留宫廷', center: [2, 41], radius: 24, color: '#a6584e', confidence: 'approximate', href: romeEntry },
      { id: 'eastern-rome', name: '东部罗马', era: '阿卡狄乌斯宫廷', center: [29, 39], radius: 25, color: '#a56a52', confidence: 'approximate', href: romeEntry },
      { id: 'sasanian', name: '萨珊帝国', era: '伊朗与两河流域', center: [54, 32], radius: 22, color: '#8a6855', confidence: 'approximate' },
      { id: 'eastern-jin', name: '东晋', era: '南北分立', center: [111, 29], radius: 18, color: '#668579', confidence: 'influence' },
      { id: 'northern-realms', name: '北方诸政权', era: '十六国后期', center: [107, 38], radius: 19, color: '#718172', confidence: 'influence' },
    ],
  },
  {
    year: 476,
    short: '476',
    title: '西部皇帝终结之后',
    fields: [
      { id: 'eastern-rome', name: '东部罗马帝国', era: '君士坦丁堡延续', center: [29, 39], radius: 24, color: '#a56a52', confidence: 'approximate', href: romeEntry },
      { id: 'western-kingdoms', name: '西部诸王国', era: '后罗马世界形成', center: [2, 45], radius: 25, color: '#80655c', confidence: 'influence' },
      { id: 'sasanian', name: '萨珊帝国', era: '伊朗与两河流域', center: [54, 32], radius: 23, color: '#8a6855', confidence: 'approximate' },
      { id: 'gupta', name: '笈多王朝', era: '北印度晚期', center: [79, 24], radius: 17, color: '#8b7956', confidence: 'influence' },
      { id: 'northern-wei', name: '北魏', era: '孝文帝改革前夕', center: [108, 39], radius: 23, color: '#718172', confidence: 'influence' },
      { id: 'southern-qi', name: '南齐', era: '南朝', center: [113, 27], radius: 16, color: '#668579', confidence: 'influence' },
    ],
  },
];

export const physicalFeatures: PhysicalFeature[] = [
  { id: 'rhine', name: '莱茵河', kind: 'river', minZoom: 1.28, coordinates: [[8.3,47.6],[8.5,49],[7.6,50.5],[6.7,51.7],[5.8,52]] },
  { id: 'danube', name: '多瑙河', kind: 'river', minZoom: 1.22, coordinates: [[8.2,48],[12,48.3],[16.4,48.2],[19,47.5],[22,45.3],[26,44.7],[29,45.1]] },
  { id: 'nile', name: '尼罗河', kind: 'river', minZoom: 1.18, coordinates: [[31.2,30.1],[31.1,27.5],[32.6,24],[32.7,19],[31.4,15.5],[31.5,9.5]] },
  { id: 'euphrates', name: '幼发拉底河', kind: 'river', minZoom: 1.35, coordinates: [[39,38.8],[38.5,36.5],[40.7,34.5],[43.6,32.5],[47.5,30.8]] },
  { id: 'tigris', name: '底格里斯河', kind: 'river', minZoom: 1.48, coordinates: [[39.5,38.2],[42.5,36],[44.2,33.5],[47.4,31]] },
  { id: 'indus', name: '印度河', kind: 'river', minZoom: 1.4, coordinates: [[75,35],[72,32],[70,29],[68,24]] },
  { id: 'yellow-river', name: '黄河', kind: 'river', minZoom: 1.34, coordinates: [[96,35],[103,37],[110,37],[113,34],[118,37]] },
  { id: 'yangtze', name: '长江', kind: 'river', minZoom: 1.38, coordinates: [[91,33],[101,30],[108,30],[114,30.5],[121,31]] },
  { id: 'alps', name: '阿尔卑斯山脉', kind: 'mountain', minZoom: 1.22, coordinates: [[5.5,44.5],[8,46],[11,46.5],[14.5,46]] },
  { id: 'atlas', name: '阿特拉斯山脉', kind: 'mountain', minZoom: 1.46, coordinates: [[-9,31],[0,34],[8,35.5]] },
  { id: 'caucasus', name: '高加索山脉', kind: 'mountain', minZoom: 1.4, coordinates: [[39,43],[44,42.5],[49,41]] },
  { id: 'himalaya', name: '喜马拉雅山脉', kind: 'mountain', minZoom: 1.2, coordinates: [[72,35],[82,30],[92,28],[98,29]] },
];

export const placeLabels: PlaceLabel[] = [
  { id: 'rome', name: '罗马', coordinates: [12.5,41.9], minZoom: 1.0, importance: 'capital', href: romeEntry },
  { id: 'carthage', name: '迦太基', coordinates: [10.3,36.9], minZoom: 1.55, importance: 'city' },
  { id: 'alexandria', name: '亚历山大里亚', coordinates: [29.9,31.2], minZoom: 1.55, importance: 'city' },
  { id: 'antioch', name: '安条克', coordinates: [36.2,36.2], minZoom: 1.6, importance: 'city' },
  { id: 'ctesiphon', name: '泰西封', coordinates: [44.6,33.1], minZoom: 1.7, importance: 'capital' },
  { id: 'chang-an', name: '长安', coordinates: [108.9,34.3], minZoom: 1.42, importance: 'capital' },
  { id: 'luoyang', name: '洛阳', coordinates: [112.5,34.7], minZoom: 1.75, importance: 'capital' },
  { id: 'pataliputra', name: '华氏城', coordinates: [85.1,25.6], minZoom: 1.72, importance: 'capital' },
  { id: 'constantinople', name: '君士坦丁堡', coordinates: [28.98,41.01], minZoom: 1.45, importance: 'capital' },
  { id: 'rubicon', name: '卢比孔河一带', coordinates: [12.35,44.1], minZoom: 2.18, importance: 'site', href: '/story/rubicon/' },
  { id: 'ravenna', name: '拉文纳', coordinates: [12.2,44.4], minZoom: 2.25, importance: 'city' },
];
