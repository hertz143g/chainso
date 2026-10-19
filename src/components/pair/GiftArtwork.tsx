export type GiftKind = "album" | "comic" | "game" | "gum" | "capsule" | "dates";

const ink = "var(--theme-text)";
const accent = "var(--theme-primary)";
const paper = "var(--theme-photo-frame)";
const line = "var(--theme-card-border)";

function Heart({ x, y, size = 24 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 24})`}>
      <path fill={accent} d="M12 21.35 10.55 20.03C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.54L12 21.35Z" />
    </g>
  );
}

function Artwork({ kind }: { kind: GiftKind }) {
  switch (kind) {
    case "album":
      return (
        <g transform="rotate(-7 120 78)">
          <rect x="45" y="23" width="150" height="107" rx="13" fill={paper} stroke={line} />
          <path d="M120 26v101" stroke={accent} strokeWidth="2" opacity=".45" />
          <rect x="57" y="37" width="51" height="66" rx="5" fill={accent} opacity=".15" />
          <circle cx="72" cy="51" r="6" fill={accent} opacity=".6" />
          <path d="m60 88 16-19 12 12 12-8 5 24H60Z" fill={accent} opacity=".5" />
          <Heart x={143} y={48} size={29} />
          <path d="M135 90h44m-38 9h32M65 113h35" stroke={ink} strokeWidth="2" strokeLinecap="round" opacity=".3" />
        </g>
      );
    case "comic":
      return (
        <g transform="rotate(5 120 78)">
          <rect x="53" y="18" width="134" height="116" rx="12" fill={paper} stroke={line} />
          <rect x="64" y="29" width="112" height="41" rx="6" fill={accent} opacity=".12" />
          <rect x="64" y="78" width="50" height="44" rx="6" fill={accent} opacity=".24" />
          <rect x="122" y="78" width="54" height="44" rx="6" fill={accent} opacity=".12" />
          <circle cx="86" cy="49" r="8" fill={accent} opacity=".75" />
          <circle cx="106" cy="49" r="8" fill={accent} opacity=".45" />
          <path d="M74 67q12-19 24 0m-4 0q12-19 24 0" stroke={accent} strokeWidth="3" fill="none" />
          <path d="M126 36h33q8 0 8 8v4q0 8-8 8h-12l-7 6v-6h-14q-8 0-8-8v-4q0-8 8-8Z" fill={paper} stroke={line} />
          <Heart x={80} y={88} size={23} />
          <path d="m138 94 8 8 13-16" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      );
    case "game":
      return (
        <>
          <g transform="rotate(-14 93 77)">
            <rect x="53" y="27" width="77" height="103" rx="14" fill={paper} stroke={line} />
            <path d="M76 51q0-13 15-13t15 13q0 8-12 13v9m0 10v1" stroke={accent} strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M70 104h40m-32 8h24" stroke={ink} strokeWidth="2" strokeLinecap="round" opacity=".25" />
          </g>
          <g transform="rotate(12 151 79)">
            <rect x="115" y="28" width="76" height="104" rx="14" fill={paper} stroke={line} />
            <Heart x={133} y={57} size={39} />
            <path d="M132 108h42" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity=".5" />
          </g>
        </>
      );
    case "gum":
      return (
        <>
          <g transform="rotate(-11 111 78)">
            <rect x="47" y="42" width="142" height="74" rx="14" fill={paper} stroke={line} />
            <rect x="58" y="53" width="120" height="51" rx="9" fill={accent} opacity=".15" />
            <Heart x={78} y={61} size={34} />
            <Heart x={116} y={61} size={34} />
          </g>
          <g transform="rotate(13 170 113)">
            <path d="m140 100-13-6v30l13-6m55-18 13-6v30l-13-6" fill={accent} opacity=".4" />
            <rect x="139" y="97" width="58" height="24" rx="8" fill={paper} stroke={line} />
            <Heart x={160} y={101} size={15} />
          </g>
        </>
      );
    case "capsule":
      return (
        <>
          <g transform="rotate(-17 120 78)">
            <rect x="77" y="22" width="86" height="112" rx="40" fill={paper} stroke={line} />
            <path d="M79 78h82" stroke={accent} strokeWidth="2" opacity=".5" />
            <rect x="94" y="39" width="32" height="26" rx="4" fill={accent} opacity=".18" transform="rotate(-9 110 52)" />
            <Heart x={116} y={49} size={23} />
            <path d="M104 97h32m-25 9h18" stroke={ink} strokeWidth="2" strokeLinecap="round" opacity=".3" />
          </g>
          <path d="m181 40 2-7 2 7 7 2-7 2-2 7-2-7-7-2Z" fill={accent} opacity=".65" />
        </>
      );
    case "dates":
      return (
        <>
          <rect x="58" y="34" width="97" height="95" rx="12" fill={accent} opacity=".18" transform="rotate(-13 106 81)" />
          <rect x="83" y="25" width="98" height="103" rx="13" fill={paper} stroke={line} transform="rotate(9 132 76)" />
          <rect x="74" y="27" width="95" height="106" rx="13" fill={paper} stroke={line} />
          <path d="M94 27v10m55-10v10" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <text x="121" y="83" textAnchor="middle" fill={ink} fontFamily="inherit" fontWeight="800" fontSize="31">100</text>
          <Heart x={109} y={94} size={24} />
        </>
      );
  }
}

export default function GiftArtwork({ kind }: { kind: GiftKind }) {
  return (
    <svg viewBox="0 0 240 156" className="pointer-events-none h-full w-full max-w-[260px] select-none" aria-hidden="true" focusable="false">
      <ellipse cx="120" cy="137" rx="65" ry="6" fill={accent} opacity=".1" />
      <Artwork kind={kind} />
    </svg>
  );
}
