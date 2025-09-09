import { createCanvas, type ImageData } from "canvas";
import type React from "react";
import { useId, useMemo } from "react";
import { calculateDisplacementMap, calculateDisplacementMap2 } from "./lib/displacementMap";
import { calculateMagnifyingDisplacementMap } from "./lib/magnifyingDisplacement";
import { calculateRefractionSpecular } from "./lib/specular";
import { CONVEX } from "./lib/surfaceEquations";

function imageDataToUrl(imageData: ImageData): string {
  const canvas = createCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

type LiquidGlassFilterProps = {
  /** 유리 객체의 너비 (픽셀 단위) */
  width: number;
  /** 유리 객체의 높이 (픽셀 단위) */
  height: number;
  /** 모서리 둥글기 반경 (픽셀 단위) */
  radius: number;
  /** 가우시안 블러 강도 */
  blur: number;
  /** 유리의 두께 (픽셀 단위) */
  glassThickness: number;
  /** 베젤(곡면 가장자리)의 너비 (픽셀 단위) */
  bezelWidth: number;
  /** 굴절률 (유리: 1.5, 물: 1.33, 다이아몬드: 2.4) */
  refractiveIndex: number;
  /** 반사광 하이라이트의 불투명도 (0~1) */
  specularOpacity: number;
  /** 반사광 영역의 채도 증가 정도 (기본값: 4) */
  specularSaturation?: number;
  /** 돋보기 효과의 확대 강도 */
  magnifyingScale?: number;
  /** 캔버스 너비 (기본값: width) */
  canvasWidth?: number;
  /** 캔버스 높이 (기본값: height) */
  canvasHeight?: number;
  /** 디바이스 픽셀 비율 */
  dpr?: number;
  /** 베젤의 높이 프로파일을 정의하는 함수 (0~1 입력, 0~1 출력) */
  bezelHeightFn?: (x: number) => number;
  /** 필터 ID를 받아 React 노드를 반환하는 렌더 프롭 */
  children?: (filterId: string) => React.ReactNode;
};

/**
 * @see https://kube.io/blog/liquid-glass-css-svg/
 * @see https://github.com/kube/kube.io/blob/main/app/data/articles/2025_10_04_liquid_glass_css_svg/components/Filter.tsx
 */
export const LiquidGlassFilter: React.FC<LiquidGlassFilterProps> = ({
  width,
  height,
  radius,
  blur,
  glassThickness,
  bezelWidth,
  refractiveIndex,
  specularOpacity,
  specularSaturation = 4,
  magnifyingScale,
  canvasWidth,
  canvasHeight,
  bezelHeightFn = CONVEX.fn,
  dpr,
  children,
}) => {
  const filterId = useId();

  // Calculate displacement map
  const { displacementMapUrl, specularLayerUrl, magnifyingMapUrl, scale } = useMemo(() => {
    // Pre-calculate displacement magnitudes
    const map = calculateDisplacementMap(glassThickness, bezelWidth, bezelHeightFn, refractiveIndex);

    const maximumDisplacement = Math.max(...map.map((v) => Math.abs(v)));

    // Calculate displacement map
    const displacementMap = calculateDisplacementMap2(
      canvasWidth ?? width,
      canvasHeight ?? height,
      width,
      height,
      radius,
      bezelWidth,
      maximumDisplacement,
      map,
      dpr,
    );

    // Calculate specular layer
    const specularLayer = calculateRefractionSpecular(width, height, radius, 50, undefined, dpr);

    // Calculate magnifying map if needed
    let magnifyingMapUrl: string | undefined;
    if (magnifyingScale !== undefined) {
      const magnifyingMap = calculateMagnifyingDisplacementMap(canvasWidth ?? width, canvasHeight ?? height);
      magnifyingMapUrl = imageDataToUrl(magnifyingMap);
    }

    return {
      displacementMapUrl: imageDataToUrl(displacementMap),
      specularLayerUrl: imageDataToUrl(specularLayer),
      magnifyingMapUrl,
      scale: maximumDisplacement,
    };
  }, [
    width,
    height,
    radius,
    glassThickness,
    bezelWidth,
    refractiveIndex,
    magnifyingScale,
    canvasWidth,
    canvasHeight,
    bezelHeightFn,
    dpr,
  ]);

  return (
    <>
      <svg colorInterpolationFilters="sRGB" style={{ display: "none" }}>
        <title>Liquid Glass Filter</title>
        <defs>
          <filter id={filterId}>
            {/* Apply magnifying effect if enabled */}
            {magnifyingScale !== undefined && magnifyingMapUrl && (
              <>
                <feImage
                  href={magnifyingMapUrl}
                  x={0}
                  y={0}
                  width={canvasWidth ?? width}
                  height={canvasHeight ?? height}
                  result="magnifying_displacement_map"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="magnifying_displacement_map"
                  scale={magnifyingScale}
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="magnified_source"
                />
              </>
            )}

            {/* Blur the source */}
            <feGaussianBlur
              in={magnifyingScale !== undefined ? "magnified_source" : "SourceGraphic"}
              stdDeviation={blur}
              result="blurred_source"
            />

            {/* Apply displacement map */}
            <feImage
              href={displacementMapUrl}
              x={0}
              y={0}
              width={canvasWidth ?? width}
              height={canvasHeight ?? height}
              result="displacement_map"
            />

            <feDisplacementMap
              in="blurred_source"
              in2="displacement_map"
              scale={scale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />

            {/* Saturate the displaced image */}
            <feColorMatrix
              in="displaced"
              type="saturate"
              values={specularSaturation.toString()}
              result="displaced_saturated"
            />

            {/* Apply specular highlight */}
            <feImage
              href={specularLayerUrl}
              x={0}
              y={0}
              width={canvasWidth ?? width}
              height={canvasHeight ?? height}
              result="specular_layer"
            />

            <feComposite in="displaced_saturated" in2="specular_layer" operator="in" result="specular_saturated" />

            <feComponentTransfer in="specular_layer" result="specular_faded">
              <feFuncA type="linear" slope={specularOpacity} />
            </feComponentTransfer>

            <feBlend in="specular_saturated" in2="displaced" mode="normal" result="withSaturation" />

            <feBlend in="specular_faded" in2="withSaturation" mode="normal" />
          </filter>
        </defs>
      </svg>
      {children?.(filterId)}
    </>
  );
};
