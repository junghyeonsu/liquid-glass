import { createImageData } from "canvas";

/**
 * 유리 표면의 스페큘러 하이라이트(반사광)를 생성합니다.
 * 
 * @description
 * 실제 유리 표면에서 보이는 빛 반사 효과를 시뮬레이션합니다.
 * 베젤(가장자리) 영역에서 특정 각도의 빛이 반사되어 보이는 
 * 림 라이트(rim light) 효과를 생성합니다.
 * 
 * 시각적 효과:
 * 1. 베젤 영역에만 하이라이트 적용
 * 2. 표면 방향과 빛 방향의 각도에 따라 밝기 결정
 * 3. 가장자리로 갈수록 페이드아웃
 * 
 * @param objectWidth - 객체 너비 (픽셀)
 * @param objectHeight - 객체 높이 (픽셀)
 * @param radius - 모서리 둥글기 반경 (픽셀)
 * @param bezelWidth - 베젤 너비 (픽셀)
 * @param specularAngle - 광원 방향 각도 (라디안, 기본값: π/3 = 60도)
 * @param dpr - 디바이스 픽셀 비율
 * @returns 스페큘러 하이라이트 ImageData
 */
export function calculateRefractionSpecular(
  objectWidth: number,
  objectHeight: number,
  radius: number,
  bezelWidth: number,
  specularAngle = Math.PI / 3,
  dpr?: number,
) {
  const devicePixelRatio = dpr ?? (typeof window !== "undefined" ? (window.devicePixelRatio ?? 1) : 1);
  const bufferWidth = objectWidth * devicePixelRatio;
  const bufferHeight = objectHeight * devicePixelRatio;
  const imageData = createImageData(bufferWidth, bufferHeight);

  const radius_ = radius * devicePixelRatio;
  const bezel_ = bezelWidth * devicePixelRatio;

  // 광원 방향 벡터 (specularAngle 각도에서 오는 빛)
  const specular_vector = [Math.cos(specularAngle), Math.sin(specularAngle)];

  // 초기값: 완전 투명 (RGBA = 0,0,0,0)
  const neutral = 0x00000000;
  new Uint32Array(imageData.data.buffer).fill(neutral);

  const radiusSquared = radius_ ** 2;
  const radiusPlusOneSquared = (radius_ + devicePixelRatio) ** 2;
  const radiusMinusBezelSquared = (radius_ - bezel_) ** 2;

  const widthBetweenRadiuses = bufferWidth - radius_ * 2;
  const heightBetweenRadiuses = bufferHeight - radius_ * 2;

  for (let y1 = 0; y1 < bufferHeight; y1++) {
    for (let x1 = 0; x1 < bufferWidth; x1++) {
      const idx = (y1 * bufferWidth + x1) * 4;

      const isOnLeftSide = x1 < radius_;
      const isOnRightSide = x1 >= bufferWidth - radius_;
      const isOnTopSide = y1 < radius_;
      const isOnBottomSide = y1 >= bufferHeight - radius_;

      const x = isOnLeftSide ? x1 - radius_ : isOnRightSide ? x1 - radius_ - widthBetweenRadiuses : 0;

      const y = isOnTopSide ? y1 - radius_ : isOnBottomSide ? y1 - radius_ - heightBetweenRadiuses : 0;

      const distanceToCenterSquared = x * x + y * y;

      const isInBezel =
        distanceToCenterSquared <= radiusPlusOneSquared && distanceToCenterSquared >= radiusMinusBezelSquared;

      // 베젤 영역의 픽셀만 처리 (안티앨리어싱 포함)
      if (isInBezel) {
        const distanceFromCenter = Math.sqrt(distanceToCenterSquared);
        const distanceFromSide = radius_ - distanceFromCenter;

        // 안티앨리어싱을 위한 페이드 효과
        const opacity =
          distanceToCenterSquared < radiusSquared
            ? 1
            : 1 -
              (distanceFromCenter - Math.sqrt(radiusSquared)) /
                (Math.sqrt(radiusPlusOneSquared) - Math.sqrt(radiusSquared));

        // 표면 방향 계산 (위에서 본 관점)
        const cos = x / distanceFromCenter;
        const sin = -y / distanceFromCenter;

        // 표면 방향과 광원 방향의 내적 (각도 유사도)
        // 값이 클수록 빛이 정면으로 반사됨
        const dotProduct = Math.abs(cos * specular_vector[0] + sin * specular_vector[1]);

        // 가장자리 근처에서 더 강한 하이라이트 효과
        const coefficient = dotProduct * Math.sqrt(1 - (1 - distanceFromSide / (1 * devicePixelRatio)) ** 2);

        const color = 255 * coefficient;
        const finalOpacity = color * coefficient * opacity;

        imageData.data[idx] = color;
        imageData.data[idx + 1] = color;
        imageData.data[idx + 2] = color;
        imageData.data[idx + 3] = finalOpacity;
      }
    }
  }
  return imageData;
}
