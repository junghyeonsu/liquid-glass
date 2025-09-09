import { type CSSProperties, type ReactNode, useState } from "react";
import { type DisplacementOptions, getDisplacementFilter } from "./getDisplacementFilter";
import { getDisplacementMap } from "./getDisplacementMap";
import styles from "./LiquidGlass.module.css";

type LiquidGlassProps = DisplacementOptions & {
  /** 유리 효과 내부에 렌더링할 React 노드 */
  children?: ReactNode | undefined;
  /** 배경 블러 강도 (기본값: 2) */
  blur?: number;
  /** 디버그 모드 - true일 경우 변위 맵을 직접 표시 */
  debug?: boolean;
};

/**
 * 액체 유리 효과를 구현하는 React 컴포넌트
 *
 * @description
 * CSS backdrop-filter와 SVG feDisplacementMap을 조합하여
 * 실제 유리처럼 보이는 굴절 효과를 생성합니다.
 * 클릭 시 유리 깊이가 변경되어 동적인 효과를 제공합니다.
 *
 * @see https://codesandbox.io/p/sandbox/liquid-glass-in-css-and-svg-g3mwqp?file=%2Fsrc%2FApp.tsx%3A14%2C1-20%2C24&from-embed
 * @see https://medium.com/ekino-france/liquid-glass-in-css-and-svg-839985fcb88d
 */
export const LiquidGlass = ({
  height,
  width,
  depth: baseDepth,
  radius,
  children,
  strength,
  chromaticAberration,
  blur = 2,
  debug = false,
}: LiquidGlassProps) => {
  /* Change element depth on click */
  const [clicked, setClicked] = useState(false);
  const depth = baseDepth / (clicked ? 0.7 : 1);

  /* Dynamic CSS properties */
  const style: CSSProperties = {
    height: `${height}px`,
    width: `${width}px`,
    borderRadius: `${radius}px`,
    backdropFilter: `blur(${blur / 2}px) url('${getDisplacementFilter({
      height,
      width,
      radius,
      depth,
      strength,
      chromaticAberration,
    })}') blur(${blur}px) brightness(1.1) saturate(1.5) `,
  };

  /* Debug mode: display the displacement map instead of actual effect */
  if (debug === true) {
    style.background = `url("${getDisplacementMap({
      height,
      width,
      radius,
      depth,
    })}")`;
    style.boxShadow = "none";
  }
  return (
    <div
      aria-hidden="true"
      className={styles.box}
      style={style}
      onMouseDown={() => setClicked(true)}
      onMouseUp={() => setClicked(false)}
    >
      {children}
    </div>
  );
};
