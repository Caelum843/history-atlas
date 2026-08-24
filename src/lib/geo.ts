/**
 * 真实地理数据 → SVG path，全部在构建期完成。
 *
 * 数据：Natural Earth，经 world-atlas 打包。
 * 刻意使用 land-*（只有海陆轮廓），**不使用 countries-***：
 * 现代国界只能提供空间参照，不能让它支配古代历史叙事。
 *
 * 精度分级与 schema 里的 accuracy 对应：
 *   110m → 世界层（survey，但极粗，仅用于方位）
 *   50m  → 地中海与意大利尺度（survey）
 * 再往下没有可用数据 —— 那正是卢比孔第三幕要讲的事，不靠放大来掩盖。
 */
import { geoEqualEarth, geoMercator, geoPath, type GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import land110 from 'world-atlas/land-110m.json';
import land50 from 'world-atlas/land-50m.json';

type AnyTopo = Parameters<typeof feature>[0];

const LAND_110 = feature(land110 as unknown as AnyTopo, (land110 as any).objects.land) as any;
const LAND_50 = feature(land50 as unknown as AnyTopo, (land50 as any).objects.land) as any;

export interface Viewport { width: number; height: number }

/**
 * 世界层：Equal Earth，等面积——不让高纬地区显得比实际大。
 *
 * 取景刻意不拟合整个地球：按内容所在的旧大陆取景，
 * 其余陆地照常绘制，只是落在画框之外。
 * 「画外还有世界」由裁切证明，不靠留白假装。
 */
function worldProjection(vp: Viewport, bounds: [[number, number], [number, number]]) {
  const box = {
    type: 'Polygon',
    coordinates: [[
      // d3-geo 在球面上要求外环为顺时针；反向会把“框外的整个地球”
      // 当成拟合对象，区域取景因此意外退回世界尺度。
      [bounds[0][0], bounds[0][1]], [bounds[0][0], bounds[1][1]],
      [bounds[1][0], bounds[1][1]], [bounds[1][0], bounds[0][1]],
      [bounds[0][0], bounds[0][1]],
    ]],
  } as any;
  return geoEqualEarth().fitExtent([[0, 0], [vp.width, vp.height]], box);
}

/** 旧大陆取景：目前全部内容都在这个范围内，其余陆地被裁到画外。 */
export const WORLD_FRAME: [[number, number], [number, number]] = [[-22, -8], [142, 60]];

export function worldLandPath(
  vp: Viewport,
  bounds: [[number, number], [number, number]] = WORLD_FRAME,
): string {
  return geoPath(worldProjection(vp, bounds))(LAND_110) ?? '';
}

/** 世界层的经纬度 → 屏幕坐标，与上面同一套投影参数。 */
export function worldProjector(
  vp: Viewport,
  bounds: [[number, number], [number, number]] = WORLD_FRAME,
) {
  const proj = worldProjection(vp, bounds);
  return (lon: number, lat: number): [number, number] => {
    const p = proj([lon, lat]);
    return p ? [p[0], p[1]] : [-9999, -9999];
  };
}

/**
 * 区域视图：给定经纬度范围，用 Mercator 拟合。
 * bounds = [[西, 南], [东, 北]]
 */
function regionProjection(
  vp: Viewport,
  bounds: [[number, number], [number, number]],
  pad = 0,
): GeoProjection {
  const box = {
    type: 'Polygon',
    coordinates: [[
      [bounds[0][0], bounds[0][1]], [bounds[0][0], bounds[1][1]],
      [bounds[1][0], bounds[1][1]], [bounds[1][0], bounds[0][1]],
      [bounds[0][0], bounds[0][1]],
    ]],
  } as any;
  return geoMercator().fitExtent(
    [[pad, pad], [vp.width - pad, vp.height - pad]],
    box,
  );
}

export interface RegionView {
  /** 陆地轮廓的 SVG path */
  land: string;
  /** 经纬度 → 屏幕坐标 */
  project: (lon: number, lat: number) => [number, number];
  /** 一串经纬度点 → SVG path（用于行军路线等） */
  line: (pts: [number, number][]) => string;
}

/** 区域视图，使用 50m 数据。 */
export function regionView(
  vp: Viewport,
  bounds: [[number, number], [number, number]],
  pad = 0,
): RegionView {
  const proj = regionProjection(vp, bounds, pad);
  const path = geoPath(proj);
  return {
    land: path(LAND_50) ?? '',
    project: (lon, lat) => {
      const p = proj([lon, lat]);
      return p ? [p[0], p[1]] : [-9999, -9999];
    },
    line: (pts) =>
      pts
        .map((p, i) => {
          const q = proj([p[0], p[1]]);
          return q ? (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1) : '';
        })
        .filter(Boolean)
        .join(' '),
  };
}

/** 常用取景。 */
export const BOUNDS = {
  /** 地中海世界：伊比利亚到黎凡特 */
  mediterranean: [[-11, 28], [40, 48]] as [[number, number], [number, number]],
  /** 意大利与亚得里亚海 */
  italy: [[6, 36], [21, 47]] as [[number, number], [number, number]],
  /** 意大利北部：拉文纳—里米尼一带。50m 数据到这个尺度已接近极限 */
  northItaly: [[9.6, 42.6], [15.4, 45.9]] as [[number, number], [number, number]],
};
