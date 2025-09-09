/**
 * 유리 표면 함수 정의
 *
 * @description
 * 각 함수는 0~1 범위의 입력을 받아 0~1 범위의 높이를 반환합니다.
 * x=0은 베젤의 바깥쪽 가장자리, x=1은 안쪽(평평한 부분과의 경계)입니다.
 */
export type SurfaceFnDef = {
  title: string;
  fn: (x: number) => number;
};

/**
 * 볼록한 원형 표면
 *
 * @description
 * 간단한 원호 형태로, 구형 돔을 만듭니다.
 * 평평한 내부로의 전환이 급격해서 굴절 가장자리가 더 날카롭게 보입니다.
 * 원형이 아닌 직사각형으로 늘어날 때 특히 눈에 띕니다.
 */
export const CONVEX_CIRCLE: SurfaceFnDef = {
  title: "Convex Circle",
  fn: (x) => Math.sqrt(1 - (1 - x) ** 2),
};

/**
 * 볼록한 스쿼클(Squircle) 표면
 *
 * @description
 * Apple이 선호하는 스쿼클 형태입니다.
 * 평평한 부분에서 곡면으로의 전환이 부드러워서
 * 직사각형으로 늘어나도 굴절 그라데이션이 매끄럽게 유지됩니다.
 * 또한 베젤이 실제보다 더 얇아 보이는 시각적 효과가 있습니다.
 */
export const CONVEX: SurfaceFnDef = {
  title: "Convex Squircle",
  fn: (x) => (1 - (1 - x) ** 4) ** (1 / 4),
};

/**
 * 오목한 표면
 *
 * @description
 * 볼록한 원형의 반대 형태로, 그릇처럼 움푹 들어간 모양입니다.
 * 빛을 바깥쪽으로 발산시켜 유리 경계 밖으로 변위가 발생합니다.
 */
export const CONCAVE: SurfaceFnDef = {
  title: "Concave",
  fn: (x) => 1 - CONVEX_CIRCLE.fn(x),
};

/**
 * 립(Lip) 표면
 *
 * @description
 * 볼록과 오목을 Smootherstep 함수로 블렌딩한 형태입니다.
 * 가장자리는 솟아있고 중앙은 살짝 들어간 모양으로,
 * 스위치 컴포넌트 같은 UI 요소에 적합합니다.
 *
 * Smootherstep: 부드러운 전환을 위한 보간 함수
 * f(x) = 6x^5 - 15x^4 + 10x^3
 */
export const LIP: SurfaceFnDef = {
  title: "Lip",
  fn: (x) => {
    const convex = CONVEX.fn(x * 2);
    const concave = CONCAVE.fn(x) + 0.1;
    const smootherstep = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
    return convex * (1 - smootherstep) + concave * smootherstep;
  },
};

export const fns: SurfaceFnDef[] = [CONVEX, CONCAVE, LIP];
