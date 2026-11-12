import { useId } from "react";
import type { Assessment, Domain } from "../types";
import { domainState } from "../compute/engine";
import { DOMAINS, STATE_LABEL } from "../data/catalog";
export function BodyAtlas({
  assessments,
  selected,
  onSelect,
  skeleton = false,
}: {
  assessments: Assessment[];
  selected: Domain;
  onSelect: (d: Domain) => void;
  skeleton?: boolean;
}) {
  const id = useId().replaceAll(":", ""),
    prefix = (s: string) => `${id}-${s}`;
  const color = (d: Domain) => {
    const s = domainState(assessments, d);
    return s === "watch"
      ? "var(--amber)"
      : s === "within"
        ? "var(--mint)"
        : s === "review"
          ? "var(--red)"
          : "var(--muted)";
  };
  const attrs = (d: Domain) => ({
    role: "button",
    tabIndex: 0,
    "aria-label": `${DOMAINS.find((x) => x.key === d)!.label}: ${STATE_LABEL[domainState(assessments, d)]}`,
    "aria-pressed": selected === d,
    onClick: () => onSelect(d),
    onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(d);
      }
    },
    className: `body-region ${selected === d ? "selected" : ""}`,
  });
  const ribs = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg
      viewBox="0 0 440 640"
      className={`body-atlas ${skeleton ? "skeleton-view" : ""}`}
      role="group"
      aria-label="Interactive anatomical schematic. Highlights represent measured signal groups, not organ health."
    >
      <defs>
        <linearGradient id={prefix("skin")} x1="0" x2="1">
          <stop stopColor="var(--atlas-skin)" stopOpacity=".08" />
          <stop offset=".48" stopColor="var(--atlas-skin)" stopOpacity=".18" />
          <stop offset="1" stopColor="var(--atlas-skin)" stopOpacity=".08" />
        </linearGradient>
        <linearGradient id={prefix("bone")} x1="0" x2="1">
          <stop stopColor="var(--atlas-bone-edge)" stopOpacity=".65" />
          <stop
            offset=".5"
            stopColor="var(--atlas-bone-center)"
            stopOpacity=".95"
          />
          <stop
            offset="1"
            stopColor="var(--atlas-bone-edge)"
            stopOpacity=".7"
          />
        </linearGradient>
        <radialGradient id={prefix("halo")}>
          <stop stopColor="var(--atlas-halo)" stopOpacity=".32" />
          <stop offset="1" stopColor="var(--atlas-halo)" stopOpacity="0" />
        </radialGradient>
        <filter
          id={prefix("glow")}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <ellipse
        cx="220"
        cy="310"
        rx="168"
        ry="290"
        fill={`url(#${prefix("halo")})`}
      />
      <g stroke="var(--atlas-grid)" strokeWidth=".6" fill="none" opacity=".23">
        <ellipse cx="220" cy="307" rx="152" ry="280" />
        <ellipse cx="220" cy="307" rx="110" ry="280" />
        <path
          d="M220 5V620M55 182H385M40 310H400M60 444H380"
          strokeDasharray="3 7"
        />
        <ellipse cx="220" cy="590" rx="96" ry="16" />
      </g>
      <g
        className="scan-guides"
        fill="var(--muted)"
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="2"
      >
        <text x="24" y="25">
          ANTERIOR
        </text>
        <text x="340" y="25">
          SCHEMATIC
        </text>
        <text x="24" y="612">
          R
        </text>
        <text x="410" y="612">
          L
        </text>
      </g>
      <path
        className="body-outline"
        d="M220 24C196 23 185 37 186 56L189 75Q192 89 204 94L204 107Q191 114 170 116Q145 118 140 138L130 187L112 244L96 299L92 324L100 337L107 332L112 311L119 305L120 319L126 317L130 290L144 248L158 208L168 174Q174 211 171 240L163 272Q159 301 172 328L180 397L175 446L177 507L181 555L170 576Q169 588 186 589L205 584L206 567L201 519L207 468L204 440L216 358L220 325L224 358L236 440L233 468L239 519L234 567L235 584L254 589Q271 588 270 576L259 555L263 507L265 446L260 397L268 328Q281 301 277 272L269 240Q266 211 272 174L282 208L296 248L310 290L314 317L320 319L321 305L328 311L333 332L340 337L348 324L344 299L328 244L310 187L300 138Q295 118 270 116Q249 114 236 107L236 94Q248 89 251 75L254 56C255 37 244 23 220 24Z"
        fill={`url(#${prefix("skin")})`}
        stroke="var(--atlas-outline)"
        strokeWidth="1.1"
      />
      <g
        className="skeleton"
        fill={`url(#${prefix("bone")})`}
        stroke="var(--atlas-bone-line)"
        strokeWidth=".7"
      >
        <path
          d="M196 61Q188 30 219 30Q251 30 244 61L241 80L230 92H210L199 80Z"
          fill="none"
        />
        <path
          d="M202 70L211 66L213 74L204 77ZM227 74L229 66L238 70L236 77Z"
          fill="var(--atlas-cavity)"
        />
        <path d="M216 81L220 75L224 81M207 85H233M211 89H229" fill="none" />
        {Array.from({ length: 25 }, (_, i) => (
          <rect
            key={i}
            x={214 + (i > 17 ? (i - 17) * 0.2 : 0)}
            y={96 + i * 7.25}
            width={12 - (i < 4 ? 3 : 0)}
            height="5.3"
            rx="1.5"
            opacity={i < 5 ? 0.9 : 0.75}
          />
        ))}
        <path d="M217 121Q196 114 174 127L161 132L159 127Q188 110 217 116ZM223 121Q244 114 266 127L279 132L281 127Q252 110 223 116Z" />
        <path d="M217 130H223L225 183L220 194L215 183Z" />
        {ribs.map((i) => (
          <g key={i} fill="none" strokeWidth="1.4" opacity={0.9 - i * 0.035}>
            <path
              d={`M215 ${132 + i * 9}Q${172 - i * 0.2} ${119 + i * 10} ${170 + i * 0.2} ${143 + i * 8}Q${172 + i * 0.2} ${158 + i * 8} 214 ${145 + i * 9}`}
            />
            <path
              d={`M225 ${132 + i * 9}Q${268 + i * 0.2} ${119 + i * 10} ${270 - i * 0.2} ${143 + i * 8}Q${268 - i * 0.2} ${158 + i * 8} 226 ${145 + i * 9}`}
            />
          </g>
        ))}
        <path d="M211 269Q186 253 176 271L174 296L193 317L211 304L216 290ZM229 269Q254 253 264 271L266 296L247 317L229 304L224 290Z" />
        <path
          d="M201 291Q180 275 186 294L198 306ZM239 291Q260 275 254 294L242 306Z"
          fill="var(--atlas-cavity)"
        />
        <path d="M214 269H226L229 291L220 309L211 291Z" />
        <path d="M157 137Q150 127 145 138L137 193Q133 206 139 209L146 207L160 146ZM283 137Q290 127 295 138L303 193Q307 206 301 209L294 207L280 146Z" />
        <path d="M137 218L117 279L121 282L143 220ZM145 218L128 281L125 281L141 217ZM303 218L323 279L319 282L297 220ZM295 218L312 281L315 281L299 217Z" />
        <ellipse cx="140" cy="213" rx="7" ry="5" />
        <ellipse cx="300" cy="213" rx="7" ry="5" />
        {[0, 1, 2, 3].map((i) => (
          <g key={"f" + i} strokeWidth="1.5" fill="none">
            <path
              d={`M${116 + i * 3} 288L${103 + i * 4} ${312 + i * 2}L${102 + i * 4} ${327 - i * 2}`}
            />
            <path
              d={`M${324 - i * 3} 288L${337 - i * 4} ${312 + i * 2}L${338 - i * 4} ${327 - i * 2}`}
            />
          </g>
        ))}
        <path d="M189 312L193 326L195 414Q189 429 196 432L202 428L203 330L198 314ZM251 312L247 326L245 414Q251 429 244 432L238 428L237 330L242 314Z" />
        <ellipse cx="196" cy="439" rx="7" ry="9" />
        <ellipse cx="244" cy="439" rx="7" ry="9" />
        <path d="M191 450L188 550L194 555L200 455ZM249 450L252 550L246 555L240 455Z" />
        <path d="M184 452L184 546M256 452L256 546" strokeWidth="2.5" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={"t" + i} fill="none" strokeWidth="1.3">
            <path
              d={`M${188 + i * 2} 558L${180 + i * 4} 577L${180 + i * 4} 583`}
            />
            <path
              d={`M${252 - i * 2} 558L${260 - i * 4} 577L${260 - i * 4} 583`}
            />
          </g>
        ))}
      </g>
      <g className="organs" opacity={skeleton ? 0.14 : 1}>
        <g {...attrs("neuro")}>
          <path
            d="M217 35C211 29 201 32 201 39C191 40 191 49 196 54C191 63 197 72 207 70L217 75ZM223 35C229 29 239 32 239 39C249 40 249 49 244 54C249 63 243 72 233 70L223 75Z"
            fill={color("neuro")}
            fillOpacity=".3"
            stroke={color("neuro")}
            strokeWidth="1.3"
          />
          <g fill="none" stroke={color("neuro")} strokeWidth=".8" opacity=".85">
            <path d="M204 39Q211 38 210 47Q201 48 202 58L212 61L210 69M197 51Q205 51 208 55M212 36L214 44M236 39Q229 38 230 47Q239 48 238 58L228 61L230 69M243 51Q235 51 232 55M228 36L226 44" />
          </g>
          <title>
            Mind and recovery: sleep, mood and fatigue, not brain condition
          </title>
        </g>
        <g {...attrs("respiratory")}>
          <path
            d="M212 139Q204 130 196 137Q176 152 175 189L177 211Q187 217 207 204L211 189ZM228 139Q236 130 244 137Q264 152 265 189L263 211Q253 217 233 204L229 189Z"
            fill={color("respiratory")}
            fillOpacity=".2"
            stroke={color("respiratory")}
            strokeWidth="1.3"
          />
          <path
            d="M220 104V150M220 143L194 170M220 143L247 171M199 164L187 188M241 164L252 187M195 172L202 189M245 172L238 191"
            fill="none"
            stroke={color("respiratory")}
            strokeWidth="2"
            opacity=".8"
          />
          <path
            d="M178 185Q193 176 208 177M234 179L264 194"
            fill="none"
            stroke={color("respiratory")}
            opacity=".7"
          />
          <title>Respiratory indicators: peripheral oxygen saturation</title>
        </g>
        <g {...attrs("cardio")}>
          <path
            d="M218 166C211 156 201 165 205 178C208 193 220 204 227 209C236 201 243 187 238 177C234 167 226 166 222 170Z"
            fill={color("cardio")}
            fillOpacity=".46"
            stroke={color("cardio")}
            strokeWidth="1.5"
          />
          <path
            d="M220 169C219 159 221 154 226 151L229 154L225 169M218 178L226 193L226 203M225 183L234 186"
            fill="none"
            stroke={color("cardio")}
            strokeWidth="2"
          />
          <title>Cardiovascular indicators, not a heart diagnosis</title>
        </g>
        <g {...attrs("metabolic")}>
          <path
            d="M180 218Q204 207 237 218L232 230Q209 240 179 230Z"
            fill={color("metabolic")}
            fillOpacity=".2"
            stroke={color("metabolic")}
          />
          <path
            d="M244 218Q255 221 254 234Q248 249 233 243Q226 239 229 233L239 232Z"
            fill={color("metabolic")}
            fillOpacity=".18"
            stroke={color("metabolic")}
          />
          <path
            d="M193 243Q187 250 192 258L197 259L198 249ZM247 243Q253 250 248 258L243 259L242 249Z"
            fill={color("metabolic")}
            fillOpacity=".4"
            stroke={color("metabolic")}
          />
          <g
            fill="none"
            stroke={color("metabolic")}
            strokeWidth="2"
            opacity=".5"
          >
            <path d="M204 244Q217 240 233 249Q242 256 229 261L206 259Q198 254 207 250L229 253M202 267Q213 273 232 266M199 240L198 267L240 272L244 248" />
          </g>
          <title>
            Metabolic indicators: glucose and temperature, not abdominal organ
            health
          </title>
        </g>
      </g>
      <g {...attrs("mobility")}>
        <path
          d="M179 328Q179 371 187 407M261 328Q261 371 253 407M186 463L183 517M254 463L257 517"
          stroke={color("mobility")}
          strokeWidth={selected === "mobility" ? 5 : 3}
          fill="none"
          opacity=".7"
        />
        <title>
          Muscle and bone: exercise proxy only; direct measurements unavailable
        </title>
      </g>
      {(
        [
          { key: "neuro", n: "01", x: 220, y: 53, lx: 93, ly: 73 },
          { key: "cardio", n: "02", x: 224, y: 183, lx: 351, ly: 169 },
          { key: "respiratory", n: "03", x: 187, y: 177, lx: 87, ly: 208 },
          { key: "metabolic", n: "05", x: 234, y: 242, lx: 353, ly: 280 },
          { key: "mobility", n: "04", x: 191, y: 371, lx: 82, ly: 397 },
          { key: "environment", n: "06", x: 311, y: 340, lx: 356, ly: 411 },
        ] as {
          key: Domain;
          n: string;
          x: number;
          y: number;
          lx: number;
          ly: number;
        }[]
      ).map(({ key, n, x, y, lx, ly }) => (
        <g key={key} {...attrs(key)}>
          <path
            d={`M${x} ${y}L${lx + (lx < 220 ? 32 : -32)} ${ly}H${lx}`}
            stroke={color(key)}
            strokeWidth=".8"
            fill="none"
            opacity={selected === key ? 1 : 0.55}
          />
          <circle cx={x} cy={y} r="3" fill={color(key)} />
          <circle cx={lx} cy={ly} r="22" fill="transparent" />
          <circle
            cx={lx}
            cy={ly}
            r={selected === key ? 16 : 13}
            fill="var(--panel)"
            stroke={color(key)}
            strokeWidth={selected === key ? 1.5 : 0.7}
          />
          {selected === key && (
            <circle
              className="selected-ring"
              cx={lx}
              cy={ly}
              r="21"
              fill="none"
              stroke={color(key)}
              strokeWidth=".6"
              opacity=".45"
            />
          )}
          <text
            x={lx}
            y={ly + 3.5}
            textAnchor="middle"
            fill={color(key)}
            fontSize="10"
            fontFamily="monospace"
          >
            {n}
          </text>
        </g>
      ))}
    </svg>
  );
}
