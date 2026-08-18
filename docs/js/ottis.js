// ═══════════════════════════════════════════════════════════════════════
//  OTTIS
//
//  One builder, called once per place he appears. Every id it emits is
//  namespaced with a per-instance uid: the same drawing appearing twice
//  with shared ids is how a mascot ends up rendering as a floating beak.
//
//  Every moving part is positioned with explicit viewBox coordinates.
//  Never use a keyword like "center top" for transform-origin here — in
//  SVG that resolves against the whole drawing, not the element, and the
//  part flies off to the top of the frame.  (That was the blink bug.)
// ═══════════════════════════════════════════════════════════════════════

let seq = 0;

export function ottisSVG(state = 'idle') {
  // Every internal id is suffixed per instance, the same way Momo does it in
  // Fluidez. Sharing ids meant url(#...) resolved into another copy and the
  // gradient-filled shapes silently painted nothing.
  const u = 'o' + (++seq);
  const g = (name) => `${name}-${u}`;

  const BLACK = '#2B2725', BLACK2 = '#383331', WHITE = '#F7F3EB',
        TAN = '#B4763E', TAN2 = '#C98B4B', NOSE = '#141211', IRIS = '#7A4F2C',
        TONGUE = '#E08D9B', CLOTH = '#F1EFE9', CHECK = '#2B2826';

  return `
<svg class="ottis" data-state="${state}" viewBox="0 0 260 320"
     xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="Ottis, a black, white and tan rescue dog">
  <defs>
    <!-- Flat fills made him read as a cut-out rather than a dog. Every big
         shape now has light falling on it from above, which is what stops
         the white chest looking like a hole in the drawing. -->
    <linearGradient id="${g('coat')}" x1="0" y1="0" x2=".25" y2="1">
      <stop offset="0%" stop-color="#3B3532"/><stop offset="100%" stop-color="#201C1A"/>
    </linearGradient>
    <linearGradient id="${g('head')}" x1="0" y1="0" x2=".3" y2="1">
      <stop offset="0%" stop-color="#403936"/><stop offset="100%" stop-color="#241F1D"/>
    </linearGradient>
    <linearGradient id="${g('bib')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FBF7EF"/><stop offset="62%" stop-color="#EADFCC"/>
      <stop offset="100%" stop-color="#CFC0A8"/>
    </linearGradient>
    <linearGradient id="${g('sock')}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#E6DAC6"/><stop offset="45%" stop-color="#F8F4EC"/>
      <stop offset="100%" stop-color="#D9CBB4"/>
    </linearGradient>
    <pattern id="${g('gingham')}" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="${CLOTH}"/>
      <rect width="3" height="3" fill="${CHECK}" opacity=".62"/>
      <rect x="3" y="3" width="3" height="3" fill="${CHECK}" opacity=".62"/>
    </pattern>
    <clipPath id="${g('band')}">
      <path d="M101 168 C114 177 146 177 159 168 L145 203 C138 209 122 209 115 203 Z"/>
    </clipPath>
  </defs>
  <ellipse cx="130" cy="307" rx="62" ry="7" fill="rgba(0,0,0,.10)"/>
  <g class="o-all">
    <g class="o-tail">
      <path d="M178 268 C208 268 224 246 222 216 C220 194 211 183 202 179"
            fill="none" stroke="${BLACK}" stroke-width="11" stroke-linecap="round"/>
      <path d="M215 199 C212 188 208 182 202 179"
            fill="none" stroke="${WHITE}" stroke-width="10.4" stroke-linecap="round"/>
    </g>
    <g class="o-body">
      <path d="M86 236 C76 258 76 292 84 304 L112 304 C104 286 104 256 110 238 Z" fill="${BLACK2}"/>
      <path d="M174 236 C184 258 184 292 176 304 L148 304 C156 286 156 256 150 238 Z" fill="${BLACK2}"/>
      <path d="M130 150 C104 152 90 184 86 220 C82 256 84 292 92 304 L168 304
               C176 292 178 256 174 220 C170 184 156 152 130 150 Z" fill="url(#${g('coat')})"/>

      <!-- The chest is a BIB, not the whole front. It used to run nearly the
           full width of him, which left the black as a thin outline and made
           him read as a white dog. -->
      <path d="M130 160 C120 163 116 188 115 214 C114 238 116 258 119 268
               C124 272 136 272 141 268 C144 258 146 238 145 214
               C144 188 140 163 130 160 Z" fill="url(#${g('bib')})"/>

      <!-- White front legs, narrower, with his black showing between them. -->
      <path d="M116 252 C113 272 113 294 116 304 L127 304 C128 294 128 272 126 252 Z"
            fill="url(#${g('sock')})"/>
      <path d="M144 252 C147 272 147 294 144 304 L133 304 C132 294 132 272 134 252 Z"
            fill="url(#${g('sock')})"/>
      <ellipse cx="121" cy="303" rx="7.5" ry="4.2" fill="#F5F0E6"/>
      <ellipse cx="139" cy="303" rx="7.5" ry="4.2" fill="#F5F0E6"/>
    </g>
    <path d="M106 126 C104 146 102 158 102 170 L158 170 C158 158 156 146 154 126 Z" fill="url(#${g('coat')})"/>
    <!-- the head casts a shadow onto the chest, so the white isn't a flat slab -->
    <path d="M112 168 C120 180 140 180 148 168 C146 186 142 196 130 198
             C118 196 114 186 112 168 Z" fill="#000" opacity=".13"/>
    <g clip-path="url(#${g('band')})"><rect x="95" y="162" width="72" height="50" fill="url(#${g('gingham')})"/></g>
    <path d="M101 168 C114 177 146 177 159 168 L145 203 C138 209 122 209 115 203 Z"
          fill="none" stroke="rgba(0,0,0,.22)" stroke-width="1.4"/>
    <g class="o-head">
      <g class="o-ear-l">
        <path d="M99 56 C78 46 62 68 65 96 C67 116 80 126 95 118 C89 100 92 72 99 56 Z" fill="url(#${g('head')})"/>
        <path d="M95 62 C88 80 87 102 93 116" fill="none" stroke="${BLACK2}" stroke-width="3" stroke-linecap="round"/>
      </g>
      <g class="o-ear-r">
        <path d="M161 56 C182 46 198 68 195 96 C193 116 180 126 165 118 C171 100 168 72 161 56 Z" fill="url(#${g('head')})"/>
        <path d="M165 62 C172 80 173 102 167 116" fill="none" stroke="${BLACK2}" stroke-width="3" stroke-linecap="round"/>
      </g>
      <path d="M130 44 C158 44 175 62 175 90 C175 112 162 128 148 134
               L112 134 C98 128 85 112 85 90 C85 62 102 44 130 44 Z" fill="url(#${g('head')})"/>
      <path d="M130 46 C136 48 138 62 136 78 C135 90 133 98 130 102
               C127 98 125 90 124 78 C122 62 124 48 130 46 Z" fill="${WHITE}"/>
      <path d="M101 108 C110 106 116 112 116 122 C116 132 109 138 100 136
               C92 134 88 126 90 118 C92 111 96 109 101 108 Z" fill="${TAN}"/>
      <path d="M159 108 C150 106 144 112 144 122 C144 132 151 138 160 136
               C168 134 172 126 170 118 C168 111 164 109 159 108 Z" fill="${TAN}"/>
      <path d="M130 98 C147 98 155 112 154 128 C153 143 143 152 130 152
               C117 152 107 143 106 128 C105 112 113 98 130 98 Z" fill="url(#${g('head')})"/>
      <path d="M130 138 C139 138 145 143 144 149 C140 154 135 156 130 156
               C125 156 120 154 116 149 C115 143 121 138 130 138 Z" fill="${WHITE}"/>
      <g class="o-tongue">
        <path d="M122 134 C122 156 138 156 138 134 Z" fill="${TONGUE}"/>
        <path d="M130 138 L130 152" stroke="rgba(0,0,0,.14)" stroke-width="1.6" stroke-linecap="round"/>
      </g>
      <ellipse cx="130" cy="124" rx="11.5" ry="8.5" fill="${NOSE}"/>
      <ellipse cx="125.8" cy="122.6" rx="2.3" ry="2.9" fill="rgba(255,255,255,.20)"/>
      <path d="M130 132 L130 137" stroke="${NOSE}" stroke-width="2.2" stroke-linecap="round"/>
      <ellipse cx="108" cy="92" rx="11" ry="11.4" fill="${BLACK2}"/>
      <ellipse cx="152" cy="92" rx="11" ry="11.4" fill="${BLACK2}"/>
      <ellipse cx="108" cy="92" rx="8.6" ry="9" fill="${IRIS}"/>
      <ellipse cx="152" cy="92" rx="8.6" ry="9" fill="${IRIS}"/>
      <circle cx="108" cy="93" r="4.6" fill="#1A120C"/>
      <circle cx="152" cy="93" r="4.6" fill="#1A120C"/>
      <circle cx="105" cy="88.4" r="3" fill="#FFF" opacity=".95"/>
      <circle cx="149" cy="88.4" r="3" fill="#FFF" opacity=".95"/>
      <g class="o-lid-l"><ellipse cx="108" cy="90" rx="12" ry="12" fill="${BLACK2}"/></g>
      <g class="o-lid-r"><ellipse cx="152" cy="90" rx="12" ry="12" fill="${BLACK2}"/></g>
      <g class="o-brow-l"><ellipse cx="106" cy="72" rx="8" ry="4.8" fill="${TAN2}"/></g>
      <g class="o-brow-r"><ellipse cx="154" cy="72" rx="8" ry="4.8" fill="${TAN2}"/></g>
    </g>
  </g>
</svg>`;
}

/** Pick a line without repeating the previous one. */
const lastSaid = {};
export function say(bucket, lines) {
  const pool = lines[bucket] || [''];
  if (pool.length === 1) return pool[0];
  let pick;
  do { pick = pool[Math.floor(Math.random() * pool.length)]; }
  while (pick === lastSaid[bucket] && pool.length > 1);
  lastSaid[bucket] = pick;
  return pick;
}
