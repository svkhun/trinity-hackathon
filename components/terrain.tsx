// Orthographic mesh of a procedural height field, drawn back-to-front.
const bump = (
  x: number,
  z: number,
  cx: number,
  cz: number,
  sx: number,
  sz: number,
  h: number,
) => h * Math.exp(-(((x - cx) / sx) ** 2 + ((z - cz) / sz) ** 2));
function point(i: number, j: number) {
  const x = i / 84,
    z = j / 50;
  const h =
    bump(x, z, 0.63, 0.46, 0.12, 0.22, 105) +
    bump(x, z, 0.78, 0.36, 0.13, 0.16, 81) +
    bump(x, z, 0.4, 0.62, 0.14, 0.18, 61) +
    bump(x, z, 0.9, 0.63, 0.13, 0.18, 52) +
    bump(x, z, 0.28, 0.4, 0.12, 0.17, 32);
  const rough =
    h *
    (0.14 * Math.sin(x * 38 + z * 22) +
      0.07 * Math.cos(x * 65 - z * 29) +
      0.06 * Math.sin(x * 105 + z * 19));
  return [
    (x * 580 + (z - 0.5) * 112).toFixed(1),
    (119 + z * 141 - h - rough + 4 * Math.sin(x * 24 + z * 12)).toFixed(1),
  ].join(",");
}
export function Terrain() {
  return (
    <svg
      className="terrain"
      viewBox="0 0 600 280"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mesh" x1="0" x2="1" y1="1" y2=".25">
          <stop stopColor="#463485" />
          <stop offset=".45" stopColor="#8463f3" />
          <stop offset=".75" stopColor="#c2a6ff" />
          <stop offset="1" stopColor="#7557cb" />
        </linearGradient>
        <radialGradient id="haze">
          <stop stopColor="#7045d7" stopOpacity=".36" />
          <stop offset="1" stopColor="#342055" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="388" cy="125" rx="270" ry="145" fill="url(#haze)" />
      {Array.from({ length: 90 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 137 + 29) % 600}
          cy={(i * 97 + 12) % 256}
          r={i % 5 === 0 ? 1 : 0.58}
          fill="#baa9ed"
          opacity={0.24 + (i % 4) * 0.12}
        />
      ))}
      {Array.from({ length: 50 }, (_, j) => {
        const row = Array.from({ length: 85 }, (_, i) => point(i, j)),
          next = Array.from({ length: 85 }, (_, i) => point(i, j + 1));
        const lines = row.map((p, i) => "M" + p + "L" + next[i]).join("");
        return (
          <g key={j}>
            <polygon
              points={[...row, ...next.slice().reverse()].join(" ")}
              fill={j < 25 ? "#211935" : "#1b162f"}
            />
            <path
              d={lines}
              stroke="url(#mesh)"
              strokeWidth=".55"
              opacity=".9"
            />
            <polyline
              points={row.join(" ")}
              fill="none"
              stroke="url(#mesh)"
              strokeWidth={j % 5 === 0 ? 1 : 0.7}
            />
          </g>
        );
      })}
      {[
        [342, 61],
        [460, 46],
        [219, 115],
      ].map(([x, y], i) => (
        <g key={x}>
          <path
            d={`M${x} ${y + 24}v-35h18`}
            stroke="#b49cf4"
            strokeWidth=".75"
            strokeDasharray="2 3"
            fill="none"
          />
          <circle cx={x} cy={y + 24} r="3" fill="#d5c5ff" />
          <text
            x={x + 22}
            y={y - 8}
            fill="#ad9bd3"
            fontFamily="monospace"
            fontSize="7"
          >
            {["SIG.01", "SIG.02", "SIG.03"][i]}
          </text>
        </g>
      ))}
    </svg>
  );
}
