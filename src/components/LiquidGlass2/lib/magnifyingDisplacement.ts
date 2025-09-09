import { createImageData } from "canvas";

/**
 * 확대경 효과를 위한 변위 맵을 생성합니다.
 * 
 * @description
 * 이 함수는 중심점에서 멀어질수록 픽셀을 바깥쪽으로 밀어내는 방사형 변위 맵을 생성합니다.
 * 이를 통해 돋보기나 확대경처럼 중심 부분이 확대되어 보이는 효과를 만들어냅니다.
 * 
 * 원리:
 * 1. 캔버스의 중심점을 기준으로 각 픽셀의 상대 위치를 계산
 * 2. 중심에서의 거리에 비례하여 변위 벡터 생성
 * 3. 변위 벡터를 RGB 채널에 인코딩 (R: X축 변위, G: Y축 변위)
 * 
 * @param canvasWidth - 캔버스 너비 (픽셀)
 * @param canvasHeight - 캔버스 높이 (픽셀)
 * @returns 확대 효과를 위한 변위 맵 ImageData
 */
export function calculateMagnifyingDisplacementMap(
  canvasWidth: number,
  canvasHeight: number
) {
  const devicePixelRatio =
    typeof window !== "undefined" ? window.devicePixelRatio ?? 1 : 1;
  const bufferWidth = canvasWidth * devicePixelRatio;
  const bufferHeight = canvasHeight * devicePixelRatio;
  const imageData = createImageData(bufferWidth, bufferHeight);

  // 정규화를 위한 최대 반경 (캔버스의 절반 크기)
  const ratio = Math.max(bufferWidth / 2, bufferHeight / 2);

  for (let y1 = 0; y1 < bufferHeight; y1++) {
    for (let x1 = 0; x1 < bufferWidth; x1++) {
      const idx = (y1 * bufferWidth + x1) * 4;

      // 중심점 기준 상대 좌표
      const x = x1 - bufferWidth / 2;
      const y = y1 - bufferHeight / 2;

      // -1 ~ 1 범위로 정규화
      const rX = x / ratio;
      const rY = y / ratio;

      // 변위 맵 인코딩
      // 128은 중립값 (변위 없음)
      // 중심에서 멀어질수록 픽셀을 더 많이 이동시킴
      imageData.data[idx] = 128 - rX * 127;     // R: X축 변위
      imageData.data[idx + 1] = 128 - rY * 127; // G: Y축 변위
      imageData.data[idx + 2] = 0;              // B: 사용 안함
      imageData.data[idx + 3] = 255;            // A: 완전 불투명
    }
  }
  return imageData;
}