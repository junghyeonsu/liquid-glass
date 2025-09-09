import "./App.css";
import { LiquidGlass } from "./components/LiquidGlass/LiquidGlass";
import { LiquidGlassFilter } from "./components/LiquidGlass2";

function App() {
  return (
    <div className="app">
      <div className="content-container">
        <article className="text-content">
          <div className="liquid-glass-container">
            <LiquidGlass
              width={200}
              height={200}
              radius={50}
              depth={1}
              blur={0}
              chromaticAberration={0}
              debug={false}
            />

            {/* New LiquidGlass2 Filter */}
            <LiquidGlassFilter
              width={200}
              height={200}
              radius={50}
              blur={0}
              glassThickness={110}
              bezelWidth={25}
              refractiveIndex={1.5}
              specularOpacity={0.5}
              specularSaturation={4}
            >
              {(filterId) => (
                <div
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 50,
                    backdropFilter: `url(#${filterId})`,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    boxShadow: "inset 0 0 4px 0px white",
                    position: "relative",
                  }}
                />
              )}
            </LiquidGlassFilter>
          </div>

          <h1>옛날 옛적에</h1>

          <p>
            깊은 산속 작은 마을에 한 나무꾼이 살고 있었습니다. 그는 매일 산에 올라가 나무를 하며 근근이 살아가고 있었죠.
            어느 화창한 봄날, 나무꾼은 평소와 다른 길로 산을 오르게 되었습니다.
          </p>

          <p>
            낯선 길을 따라 한참을 걷다 보니, 그는 지금까지 본 적 없는 아름다운 계곡을 발견했습니다. 맑은 물이 흐르고,
            온갖 꽃들이 만개한 그곳은 마치 선계와도 같았습니다. 계곡 한가운데는 커다란 바위가 있었고, 그 위에서 두
            노인이 바둑을 두고 있었습니다.
          </p>

          <p>
            신기한 마음에 나무꾼은 바위 위로 올라가 바둑 구경을 하기 시작했습니다. 두 노인의 바둑 실력은 놀라울
            정도였고, 나무꾼은 시간 가는 줄 모르고 구경에 빠져들었습니다. 한 수, 두 수... 바둑판 위에서 펼쳐지는
            묘수들은 그의 눈을 뗄 수 없게 만들었죠.
          </p>

          <h2>시간의 흐름</h2>

          <p>
            문득 정신을 차린 나무꾼은 해가 저물고 있음을 깨달았습니다. 서둘러 집으로 가려고 일어서는데, 옆에 두었던 도끼
            자루가 썩어 부스러져 있었습니다. 놀란 나무꾼이 급히 마을로 내려가 보니, 그가 알던 마을의 모습은
            온데간데없었습니다.
          </p>

          <p>
            낯선 사람들, 낯선 집들... 모든 것이 변해 있었습니다. 겨우 찾아간 자기 집터에는 이미 다른 사람들이 살고
            있었고, 그들은 나무꾼을 전혀 알아보지 못했습니다. 마을 사람들에게 물어보니, 백 년 전에 산에서 실종된
            나무꾼의 전설이 있다고 했습니다.
          </p>

          <p>
            나무꾼은 그제야 깨달았습니다. 신선들의 바둑 한 판이 인간 세상의 백 년이었다는 것을. 계곡에서 바둑을 구경한
            시간은 고작 반나절이었지만, 인간 세상에서는 이미 백 년이라는 세월이 흘러버린 것이었습니다.
          </p>

          <h2>교훈과 여운</h2>

          <p>
            이 이야기는 우리에게 시간의 상대성과 삶의 무상함을 일깨워줍니다. 신선의 세계와 인간의 세계가 다르듯, 우리가
            느끼는 시간의 흐름도 각자 다를 수 있습니다. 때로는 즐거운 순간은 너무 빨리 지나가고, 힘든 시간은 더디게
            흐르는 것처럼 느껴지죠.
          </p>

          <p>
            또한 이 이야기는 우리가 무언가에 몰입할 때 시간을 잊게 되는 경험을 은유적으로 표현한 것이기도 합니다.
            좋아하는 일에 빠져있을 때, 사랑하는 사람과 함께할 때, 우리는 종종 시간이 멈춘 듯한 느낌을 받곤 합니다.
          </p>

          <p>
            나무꾼의 이야기는 여기서 끝이 났지만, 그가 남은 생을 어떻게 살았는지는 아무도 모릅니다. 어쩌면 그는 다시 그
            신비로운 계곡을 찾아 헤맸을지도 모르고, 어쩌면 새로운 세상에 적응하며 살아갔을지도 모릅니다.
          </p>

          <p className="epilogue">
            세월이 흘러도 변하지 않는 것은 이야기 속에 담긴 지혜입니다. 우리도 때로는 일상에서 벗어나 새로운 경험을
            하고, 시간의 소중함을 되새기며 살아가야 하지 않을까요?
          </p>
        </article>
      </div>
    </div>
  );
}

export default App;
