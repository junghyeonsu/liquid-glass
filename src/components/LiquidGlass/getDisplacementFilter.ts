import { getDisplacementMap } from "./getDisplacementMap";

export type DisplacementOptions = {
  /** 유리 요소의 높이 (픽셀 단위) */
  height: number;
  /** 유리 요소의 너비 (픽셀 단위) */
  width: number;
  /** 모서리 둥글기 반경 (픽셀 단위) */
  radius: number;
  /** 유리의 깊이/두께 (픽셀 단위) */
  depth: number;
  /** 굴절 효과의 강도 (기본값: 100) */
  strength?: number;
  /** 색수차 효과의 강도 (기본값: 0) */
  chromaticAberration?: number;
};

/**
 * 변위 필터를 생성합니다.
 *
 * @description
 * SVG feDisplacementMap 필터를 생성하여 유리의 굴절 효과를 구현합니다.
 * 실험적인 "색수차(chromatic aberration)" 효과를 포함하며,
 * 필요하지 않은 경우 첫 번째 feColorMatrix부터 마지막 feBlend까지 제거할 수 있습니다.
 *
 * @param height - 유리 요소의 높이 (픽셀 단위)
 * @param width - 유리 요소의 너비 (픽셀 단위)
 * @param radius - 모서리 둥글기 반경 (픽셀 단위)
 * @param depth - 유리의 깊이/두께 (픽셀 단위)
 * @param strength - 굴절 효과의 강도 (기본값: 100)
 * @param chromaticAberration - 색수차 효과의 강도 (기본값: 0)
 * @returns SVG 필터가 포함된 data URI 문자열
 *
 * Creating the displacement filter.
 * The file complexity is due to the experimental "chromatic aberration" effect;
 * filters from first `feColorMatrix` to last `feBlend` can be removed if the effect is not needed.
 */
export const getDisplacementFilter = ({
  height,
  width,
  radius,
  depth,
  strength = 100,
  chromaticAberration = 0,
}: DisplacementOptions) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <filter id="displace" color-interpolation-filters="sRGB">
            <feImage x="0" y="0" height="${height}" width="${width}" href="${getDisplacementMap({
              height,
              width,
              radius,
              depth,
            })}" result="displacementMap" />
            <feDisplacementMap
                transform-origin="center"
                in="SourceGraphic"
                in2="displacementMap"
                scale="${strength + chromaticAberration * 2}"
                xChannelSelector="R"
                yChannelSelector="G"
            />
            <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="displacedR"
                    />
            <feDisplacementMap
                in="SourceGraphic"
                in2="displacementMap"
                scale="${strength + chromaticAberration}"
                xChannelSelector="R"
                yChannelSelector="G"
            />
            <feColorMatrix
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="displacedG"
                    />
            <feDisplacementMap
                    in="SourceGraphic"
                    in2="displacementMap"
                    scale="${strength}"
                    xChannelSelector="R"
                    yChannelSelector="G"
                />
                <feColorMatrix
                type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0
                        0 0 1 0 0
                        0 0 0 1 0"
                result="displacedB"
                        />
              <feBlend in="displacedR" in2="displacedG" mode="screen"/>
              <feBlend in2="displacedB" mode="screen"/>
        </filter>
    </defs>
</svg>`) +
  "#displace";
