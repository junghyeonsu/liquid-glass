import { createImageData } from "canvas";

/**
 * 유리 표면의 굴절으로 인한 빛의 변위를 사전 계산합니다.
 *
 * @description
 * 스넬의 법칙(Snell's Law)을 사용하여 빛이 유리를 통과할 때 얼마나 휘어지는지 계산합니다.
 * 이 함수는 베젤(유리 가장자리의 곡면) 영역에서의 굴절을 1차원으로 사전 계산하여,
 * 나중에 2D 변위 맵을 생성할 때 재사용할 수 있도록 합니다.
 *
 * 물리학적 원리:
 * 1. 빛이 공기(n=1.0)에서 유리(n=1.5)로 진입할 때 굴절각이 변함
 * 2. 표면의 기울기(법선 벡터)에 따라 굴절 방향이 결정됨
 * 3. 유리 두께와 베젤 너비에 따라 최종 변위가 결정됨
 *
 * @param glassThickness - 유리의 두께 (픽셀 단위)
 * @param bezelWidth - 베젤(곡면 가장자리)의 너비 (픽셀 단위)
 * @param bezelHeightFn - 베젤의 높이 프로파일을 정의하는 함수 (0~1 입력, 0~1 출력)
 * @param refractiveIndex - 굴절률 (유리: 1.5, 물: 1.33, 다이아몬드: 2.4)
 * @param samples - 샘플링 개수 (해상도)
 * @returns 각 샘플 지점에서의 X축 변위 배열
 */
export function calculateDisplacementMap(
  glassThickness = 200,
  bezelWidth = 50,
  bezelHeightFn: (x: number) => number = (x) => x,
  refractiveIndex = 1.5,
  samples = 128,
): number[] {
  // 굴절률 비율 (공기/유리)
  // eta < 1이면 빛이 법선 쪽으로 휘어짐
  const eta = 1 / refractiveIndex;

  /**
   * 스넬의 법칙을 사용하여 굴절된 광선의 방향을 계산합니다.
   * 단순화를 위해 입사 광선은 항상 수직([0, 1])이라고 가정합니다.
   */
  function refract(normalX: number, normalY: number): [number, number] | null {
    const dot = normalY;
    const k = 1 - eta * eta * (1 - dot * dot);
    if (k < 0) {
      // 전반사(Total Internal Reflection) 발생
      // 임계각을 넘어서면 빛이 굴절되지 않고 반사됨
      return null;
    }
    const kSqrt = Math.sqrt(k);
    // 굴절된 광선의 방향 벡터 계산
    return [-(eta * dot + kSqrt) * normalX, eta - (eta * dot + kSqrt) * normalY];
  }

  return Array.from({ length: samples }, (_, i) => {
    const x = i / samples; // 0~1 범위의 베젤 위치
    const y = bezelHeightFn(x); // 해당 위치의 높이

    // 표면의 기울기(미분) 계산
    const dx = x < 1 ? 0.0001 : -0.0001;
    const y2 = bezelHeightFn(x + dx);
    const derivative = (y2 - y) / dx;

    // 법선 벡터 계산 (표면에 수직인 방향)
    const magnitude = Math.sqrt(derivative * derivative + 1);
    const normal = [-derivative / magnitude, -1 / magnitude];

    // 굴절 방향 계산
    const refracted = refract(normal[0], normal[1]);

    if (!refracted) {
      return 0; // 전반사 발생 시 변위 없음
    }

    // 빛이 유리를 통과하는 거리 계산
    const remainingHeightOnBezel = y * bezelWidth;
    const remainingHeight = remainingHeightOnBezel + glassThickness;

    // X축 변위 계산: 굴절 방향과 통과 거리를 곱함
    return refracted[0] * (remainingHeight / refracted[1]);
  });
}

/**
 * 2D 변위 맵 이미지를 생성합니다.
 *
 * @description
 * 사전 계산된 1D 변위 데이터를 사용하여 실제 SVG 필터에서 사용할 2D 변위 맵을 생성합니다.
 * 이 맵은 각 픽셀이 얼마나, 어느 방향으로 이동해야 하는지를 RGB 채널에 인코딩합니다.
 *
 * 변위 맵 인코딩:
 * - R 채널: X축 변위 (0=왼쪽, 128=중립, 255=오른쪽)
 * - G 채널: Y축 변위 (0=위, 128=중립, 255=아래)
 * - B 채널: 사용 안함
 * - A 채널: 투명도 (항상 255)
 *
 * @param canvasWidth - 캔버스 너비
 * @param canvasHeight - 캔버스 높이
 * @param objectWidth - 유리 객체의 너비
 * @param objectHeight - 유리 객체의 높이
 * @param radius - 모서리 둥글기 반경
 * @param bezelWidth - 베젤 너비
 * @param maximumDisplacement - 최대 변위값 (정규화용)
 * @param precomputedDisplacementMap - 사전 계산된 변위 배열
 * @param dpr - 디바이스 픽셀 비율
 * @returns 변위 맵 ImageData
 */
export function calculateDisplacementMap2(
  canvasWidth: number,
  canvasHeight: number,
  objectWidth: number,
  objectHeight: number,
  radius: number,
  bezelWidth: number,
  maximumDisplacement: number,
  precomputedDisplacementMap: number[] = [],
  dpr?: number,
) {
  const devicePixelRatio = dpr ?? (typeof window !== "undefined" ? (window.devicePixelRatio ?? 1) : 1);
  const bufferWidth = canvasWidth * devicePixelRatio;
  const bufferHeight = canvasHeight * devicePixelRatio;
  const imageData = createImageData(bufferWidth, bufferHeight);

  // Fill neutral color using buffer
  const neutral = 0xff008080;
  new Uint32Array(imageData.data.buffer).fill(neutral);

  const radius_ = radius * devicePixelRatio;
  const bezel = bezelWidth * devicePixelRatio;

  const radiusSquared = radius_ ** 2;
  const radiusPlusOneSquared = (radius_ + 1) ** 2;
  const radiusMinusBezelSquared = (radius_ - bezel) ** 2;

  const objectWidth_ = objectWidth * devicePixelRatio;
  const objectHeight_ = objectHeight * devicePixelRatio;
  const widthBetweenRadiuses = objectWidth_ - radius_ * 2;
  const heightBetweenRadiuses = objectHeight_ - radius_ * 2;

  const objectX = (bufferWidth - objectWidth_) / 2;
  const objectY = (bufferHeight - objectHeight_) / 2;

  for (let y1 = 0; y1 < objectHeight_; y1++) {
    for (let x1 = 0; x1 < objectWidth_; x1++) {
      const idx = ((objectY + y1) * bufferWidth + objectX + x1) * 4;

      const isOnLeftSide = x1 < radius_;
      const isOnRightSide = x1 >= objectWidth_ - radius_;
      const isOnTopSide = y1 < radius_;
      const isOnBottomSide = y1 >= objectHeight_ - radius_;

      const x = isOnLeftSide ? x1 - radius_ : isOnRightSide ? x1 - radius_ - widthBetweenRadiuses : 0;

      const y = isOnTopSide ? y1 - radius_ : isOnBottomSide ? y1 - radius_ - heightBetweenRadiuses : 0;

      const distanceToCenterSquared = x * x + y * y;

      const isInBezel =
        distanceToCenterSquared <= radiusPlusOneSquared && distanceToCenterSquared >= radiusMinusBezelSquared;

      // Only write non-neutral displacements (when isInBezel)
      if (isInBezel) {
        const opacity =
          distanceToCenterSquared < radiusSquared
            ? 1
            : 1 -
              (Math.sqrt(distanceToCenterSquared) - Math.sqrt(radiusSquared)) /
                (Math.sqrt(radiusPlusOneSquared) - Math.sqrt(radiusSquared));

        const distanceFromCenter = Math.sqrt(distanceToCenterSquared);
        const distanceFromSide = radius_ - distanceFromCenter;

        // Viewed from top
        const cos = x / distanceFromCenter;
        const sin = y / distanceFromCenter;

        const bezelIndex = ((distanceFromSide / bezel) * precomputedDisplacementMap.length) | 0;
        const distance = precomputedDisplacementMap[bezelIndex] ?? 0;

        const dX = (-cos * distance) / maximumDisplacement;
        const dY = (-sin * distance) / maximumDisplacement;

        imageData.data[idx] = 128 + dX * 127 * opacity; // R
        imageData.data[idx + 1] = 128 + dY * 127 * opacity; // G
        imageData.data[idx + 2] = 0; // B
        imageData.data[idx + 3] = 255; // A
      }
    }
  }
  return imageData;
}
