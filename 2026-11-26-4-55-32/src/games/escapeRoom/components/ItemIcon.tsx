import React from 'react';

interface ItemIconProps {
  itemId: string;
  className?: string;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ itemId, className = 'w-9 h-9' }) => {
  switch (itemId) {
    // 1. 참나무 자루 (Oak Wood Handle) - Detailed carved timber branch with oak bark & notch
    case 'oak_handle':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id="oakWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#96613b" />
              <stop offset="50%" stopColor="#6e3f20" />
              <stop offset="100%" stopColor="#4a2711" />
            </linearGradient>
            <linearGradient id="oakBarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#442614" />
              <stop offset="100%" stopColor="#2e1709" />
            </linearGradient>
          </defs>
          {/* Main oak wood limb */}
          <path
            d="M12 52 C18 46 44 20 52 12 C55 9 58 11 56 15 C50 25 24 50 16 56 C13 58 10 55 12 52 Z"
            fill="url(#oakWoodGrad)"
            stroke="#2b1407"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Bark texture & rings */}
          <path d="M19 49 C22 46 25 48 27 45" stroke="#b87d52" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M29 39 C32 36 36 38 38 34" stroke="#42210e" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M39 29 C42 27 45 28 47 24" stroke="#b87d52" strokeWidth="1.5" strokeLinecap="round" />
          {/* Carved notch at the tip (for stone blade insertion) */}
          <path d="M47 17 L52 12 L50 21 Z" fill="#c49a78" stroke="#3d1d0c" strokeWidth="1" />
          {/* Wood cut rings at base */}
          <ellipse cx="14" cy="54" rx="3.5" ry="2" fill="#d9ad8b" stroke="#3d1d0c" strokeWidth="1" />
          {/* Small leaf bud sprouting from oak branch */}
          <path d="M26 42 C23 37 25 33 28 35 C28 38 27 41 26 42 Z" fill="#608038" stroke="#334d19" strokeWidth="1" />
        </svg>
      );

    // 2. 칼 (Chipped Flint/Obsidian Stone Knife Tool)
    case 'umjib_knife':
    case 'umjib_blade':
    case 'umjib_flint':
    case 'umjib_key':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id="flintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a4d52" />
              <stop offset="40%" stopColor="#2c3036" />
              <stop offset="85%" stopColor="#1a1c20" />
              <stop offset="100%" stopColor="#0d0e12" />
            </linearGradient>
            <linearGradient id="flintFacetGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#62676f" />
              <stop offset="50%" stopColor="#3b3f46" />
              <stop offset="100%" stopColor="#1e2024" />
            </linearGradient>
            <linearGradient id="leatherGripGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a3704c" />
              <stop offset="60%" stopColor="#7a4b27" />
              <stop offset="100%" stopColor="#4d2c12" />
            </linearGradient>
          </defs>
          {/* Main Knapped Stone Blade Body with serrated conchoidal flake scars */}
          <path
            d="M16 48 L22 36 L26 26 L38 12 C41 9 44 10 45 13 L47 22 L51 32 L46 44 L36 54 L24 55 Z"
            fill="url(#flintGrad)"
            stroke="#111317"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Conchoidal fracture facets (authentic knapped stone flake planes) */}
          <path
            d="M38 12 L30 26 L36 38 L47 22 Z"
            fill="url(#flintFacetGrad)"
            opacity="0.85"
          />
          <path
            d="M30 26 L22 36 L32 46 L36 38 Z"
            fill="#343840"
            opacity="0.7"
          />
          <path
            d="M47 22 L51 32 L44 38 Z"
            fill="#525760"
            opacity="0.65"
          />
          {/* Sharp knapped razor cutting edge highlights */}
          <path
            d="M38 12 L26 26 L22 36 L16 48"
            stroke="#9ba2ad"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Micro-serration knapping notches */}
          <line x1="26" y1="26" x2="28" y2="28" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
          <line x1="32" y1="19" x2="34" y2="21" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
          <line x1="22" y1="36" x2="24" y2="37" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
          {/* Blade tip razor gleam */}
          <circle cx="39" cy="12" r="1.5" fill="#ffffff" opacity="0.9" />

          {/* Raw Leather/Hemp Cord Wrap on Grip Base (hand protection) */}
          <path
            d="M15 48 C18 45 28 47 38 52 C35 55 24 57 16 53 Z"
            fill="url(#leatherGripGrad)"
            stroke="#3a1e0b"
            strokeWidth="1"
          />
          <path d="M19 46 L27 55" stroke="#331806" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M25 47 L33 54" stroke="#331806" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M30 49 L36 53" stroke="#331806" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    // 3. 흑색 점판암 조각 (Black Slate Stone Flake)
    case 'slate_shard':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id="slateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a525a" />
              <stop offset="50%" stopColor="#2c333a" />
              <stop offset="100%" stopColor="#14171a" />
            </linearGradient>
          </defs>
          {/* Sharp flaked triangular slate */}
          <path
            d="M32 10 L52 46 L38 54 L14 48 L18 24 Z"
            fill="url(#slateGrad)"
            stroke="#0f1214"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Flaking facet ridges */}
          <path d="M32 10 L34 36 L14 48" stroke="#68737d" strokeWidth="1.5" />
          <path d="M34 36 L52 46" stroke="#202428" strokeWidth="1.5" />
          <path d="M34 36 L38 54" stroke="#525d66" strokeWidth="1.5" />
          {/* Sharp edge glint */}
          <path d="M22 17 L31 11 L43 28" stroke="#94a1ab" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        </svg>
      );

    // 4. 사슴 힘줄 끈 (Deer Sinew Cord / Rawhide Thong)
    case 'sinew_cord':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id="sinewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e3cfb3" />
              <stop offset="60%" stopColor="#bfa37c" />
              <stop offset="100%" stopColor="#876846" />
            </linearGradient>
          </defs>
          {/* Coiled natural cord */}
          <ellipse cx="32" cy="34" rx="20" ry="14" fill="none" stroke="url(#sinewGrad)" strokeWidth="5" />
          <ellipse cx="32" cy="34" rx="15" ry="10" fill="none" stroke="#6b4e31" strokeWidth="3" />
          <ellipse cx="32" cy="33" rx="10" ry="6" fill="none" stroke="url(#sinewGrad)" strokeWidth="4" />
          {/* Cross bindings & knot */}
          <rect x="28" y="18" width="8" height="28" rx="3" fill="#a17c55" stroke="#4d3319" strokeWidth="1.5" />
          <line x1="28" y1="24" x2="36" y2="24" stroke="#e0cca8" strokeWidth="1.5" />
          <line x1="28" y1="30" x2="36" y2="30" stroke="#e0cca8" strokeWidth="1.5" />
          <line x1="28" y1="36" x2="36" y2="36" stroke="#e0cca8" strokeWidth="1.5" />
          {/* Dangling cord ends */}
          <path d="M36 44 C42 48 46 54 44 58" stroke="url(#sinewGrad)" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 44 C26 50 24 56 28 60" stroke="#7a5836" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    // 5. 마제석검 / 간돌검 (Polished Stone Dagger)
    case 'stone_dagger':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7a8591" />
              <stop offset="50%" stopColor="#434c54" />
              <stop offset="100%" stopColor="#252a2e" />
            </linearGradient>
          </defs>
          {/* Double-edged stone blade with central ridge */}
          <path
            d="M48 10 L54 16 L34 36 L28 30 Z"
            fill="url(#bladeGrad)"
            stroke="#16191c"
            strokeWidth="1.5"
          />
          {/* Central ridge line */}
          <line x1="51" y1="13" x2="31" y2="33" stroke="#9ba8b5" strokeWidth="1.5" />
          {/* Stone crossguard */}
          <ellipse cx="29" cy="35" rx="6" ry="3" transform="rotate(-45 29 35)" fill="#252a2e" stroke="#16191c" strokeWidth="1.5" />
          {/* Wooden handle with sinew cord wrapping */}
          <path d="M26 38 L14 50" stroke="#875631" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M26 38 L14 50" stroke="#d4bb98" strokeWidth="4.5" strokeDasharray="3 3" strokeLinecap="round" />
          {/* Pommel */}
          <circle cx="12" cy="52" r="3.5" fill="#4a2e16" stroke="#1f1106" strokeWidth="1.5" />
          {/* Sharp blade tip glint */}
          <circle cx="51" cy="13" r="1.5" fill="#ffffff" />
        </svg>
      );

    // 6. 천문 제단 암호 석판 (Stone Tablet with Astronomical Star Chart)
    case 'altar_cipher':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id="tabletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#635d55" />
              <stop offset="100%" stopColor="#3d3731" />
            </linearGradient>
          </defs>
          {/* Weathered Stone Slab */}
          <rect x="12" y="10" width="40" height="44" rx="4" fill="url(#tabletGrad)" stroke="#24201c" strokeWidth="2" />
          {/* Concentric astronomical petroglyphs */}
          <circle cx="32" cy="30" r="14" stroke="#d9c39e" strokeWidth="1.5" strokeDasharray="4 2" />
          <circle cx="32" cy="30" r="9" stroke="#d9c39e" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="32" cy="30" r="4" stroke="#f0dba8" strokeWidth="1.5" />
          {/* Star markers & angle notches */}
          <circle cx="32" cy="16" r="1.5" fill="#ffeaa7" />
          <circle cx="46" cy="30" r="1.5" fill="#ffeaa7" />
          <circle cx="32" cy="44" r="1.5" fill="#ffeaa7" />
          <line x1="32" y1="16" x2="32" y2="24" stroke="#ffb86c" strokeWidth="1" />
          <line x1="32" y1="30" x2="41" y2="30" stroke="#ffb86c" strokeWidth="1" />
          {/* Chipped stone fracture corner */}
          <path d="M46 10 L52 16 L49 18 Z" fill="#24201c" />
        </svg>
      );

    // 7. 유물 / 환유경 (Ancient Concave Sun Mirror)
    case 'ancient_mirror':
    case 'relic_fragment':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <radialGradient id="mirrorBronze" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffea9f" />
              <stop offset="40%" stopColor="#d4a34b" />
              <stop offset="70%" stopColor="#8c6227" />
              <stop offset="90%" stopColor="#3d6350" />
              <stop offset="100%" stopColor="#1e362a" />
            </radialGradient>
          </defs>
          {/* Outer bronze mirror ring */}
          <circle cx="32" cy="32" r="22" fill="url(#mirrorBronze)" stroke="#2b4737" strokeWidth="2.5" />
          {/* Petroglyph sun rays */}
          <circle cx="32" cy="32" r="15" stroke="#f0d584" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="32" cy="32" r="8" fill="#e6c265" stroke="#875e21" strokeWidth="1.5" />
          {/* Sun center core */}
          <circle cx="32" cy="32" r="3" fill="#ffffff" />
          <path d="M32 12 L32 16" stroke="#fce6a2" strokeWidth="2" strokeLinecap="round" />
          <path d="M52 32 L48 32" stroke="#fce6a2" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 52 L32 48" stroke="#fce6a2" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 32 L16 32" stroke="#fce6a2" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    // 8. 학술 조사 수첩 (Field Notebook)
    case 'research_notebook':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <rect x="14" y="12" width="36" height="42" rx="3" fill="#54311c" stroke="#241208" strokeWidth="2" />
          <rect x="14" y="12" width="8" height="42" rx="2" fill="#3b2010" stroke="#241208" strokeWidth="1.5" />
          {/* Gold embossed title emblem */}
          <circle cx="34" cy="30" r="7" stroke="#e0b567" strokeWidth="1.5" />
          <circle cx="34" cy="30" r="3" fill="#e0b567" />
          {/* Ribbon bookmark */}
          <path d="M42 48 L42 58 L39 55 L36 58 L36 48 Z" fill="#b02a2a" />
        </svg>
      );

    // 9. 국궁 줌통 (Bow Grip) - Center wooden handle with birch bark wrapping
    case 'grip':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id="gripGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d9b48f" />
              <stop offset="50%" stopColor="#a3784e" />
              <stop offset="100%" stopColor="#694625" />
            </linearGradient>
          </defs>
          <rect x="22" y="14" width="20" height="36" rx="5" fill="url(#gripGrad)" stroke="#3d240e" strokeWidth="2" />
          {/* Traditional birch bark wrapping bands */}
          <line x1="22" y1="22" x2="42" y2="22" stroke="#4a2d13" strokeWidth="1.5" />
          <line x1="22" y1="28" x2="42" y2="28" stroke="#f0d5b6" strokeWidth="1.5" />
          <line x1="22" y1="34" x2="42" y2="34" stroke="#4a2d13" strokeWidth="1.5" />
          <line x1="22" y1="40" x2="42" y2="40" stroke="#f0d5b6" strokeWidth="1.5" />
          <ellipse cx="32" cy="14" rx="10" ry="3" fill="#82572e" />
          <ellipse cx="32" cy="50" rx="10" ry="3" fill="#4d2c0f" />
        </svg>
      );

    // 10. 긴 활채 (Bow Limb / Upper Body) - Curved composite horn & bamboo limb
    case 'upper':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id="limbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bf7b3b" />
              <stop offset="60%" stopColor="#7a4417" />
              <stop offset="100%" stopColor="#422008" />
            </linearGradient>
          </defs>
          <path
            d="M12 50 C24 38 46 22 52 14 C48 12 42 16 34 26 C22 40 14 46 12 50 Z"
            fill="url(#limbGrad)"
            stroke="#2e1505"
            strokeWidth="2"
          />
          <path d="M16 48 C26 36 42 22 48 16" stroke="#e0a96d" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    // 11. 활고자 (Bow Tip / Lower/Upper Nock) - Curved mulberry nock for bowstring
    case 'lower':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <path
            d="M18 52 C26 44 32 30 36 18 C38 12 46 10 48 16 C48 22 40 32 34 46 C30 54 22 56 18 52 Z"
            fill="#804a1f"
            stroke="#381b07"
            strokeWidth="2"
          />
          {/* Nock notch for string loop */}
          <path d="M42 16 C40 18 43 22 47 21" stroke="#240f02" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="44" cy="18" rx="2" ry="3" fill="#d99b66" />
        </svg>
      );

    // 12. 시위 (Bowstring) - High tensile sinew/silk cord with loops
    case 'string':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <path d="M14 54 C24 40 40 24 50 10" stroke="#f0eedb" strokeWidth="3" strokeLinecap="round" />
          <path d="M14 54 C24 40 40 24 50 10" stroke="#998767" strokeWidth="1" strokeDasharray="3 2" />
          {/* Loop at tip */}
          <ellipse cx="50" cy="10" rx="3.5" ry="5" transform="rotate(-35 50 10)" fill="none" stroke="#f0eedb" strokeWidth="2" />
          <ellipse cx="14" cy="54" rx="3.5" ry="5" transform="rotate(-35 14 54)" fill="none" stroke="#f0eedb" strokeWidth="2" />
        </svg>
      );

    // 13. 화살 살대 (Arrow Shaft) - Straight bamboo shaft
    case 'shaft':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <line x1="12" y1="52" x2="52" y2="12" stroke="#b08b59" strokeWidth="4" strokeLinecap="round" />
          <line x1="12" y1="52" x2="52" y2="12" stroke="#d6b383" strokeWidth="1.5" strokeLinecap="round" />
          {/* Bamboo joints */}
          <line x1="24" y1="42" x2="26" y2="38" stroke="#543b18" strokeWidth="2" />
          <line x1="38" y1="28" x2="40" y2="24" stroke="#543b18" strokeWidth="2" />
        </svg>
      );

    // 14. 화살촉 (Arrowhead) - Chipped obsidian/bronze arrowhead
    case 'arrowhead':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <polygon points="32,8 48,36 38,36 38,54 26,54 26,36 16,36" fill="#36393e" stroke="#141517" strokeWidth="2" />
          <polygon points="32,8 38,36 32,32 26,36" fill="#585e69" />
          <line x1="32" y1="8" x2="32" y2="32" stroke="#aab2bf" strokeWidth="1.5" />
          <circle cx="32" cy="10" r="1.5" fill="#ffffff" />
        </svg>
      );

    // 15. 깃과 오늬 (Arrow Fletching & Nock) - Pheasant feathers and string notch
    case 'feather':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          {/* Arrow shaft end */}
          <line x1="16" y1="48" x2="44" y2="20" stroke="#876239" strokeWidth="3.5" strokeLinecap="round" />
          {/* Feather 1 */}
          <path d="M22 42 C20 34 26 28 34 30 C30 36 26 40 22 42 Z" fill="#c47833" stroke="#572e0e" strokeWidth="1" />
          {/* Feather 2 */}
          <path d="M26 46 C34 44 40 50 38 42 C32 40 28 44 26 46 Z" fill="#a85822" stroke="#572e0e" strokeWidth="1" />
          {/* Nock notch */}
          <path d="M14 50 L16 48 L14 46" stroke="#e0cca8" strokeWidth="2" fill="none" />
        </svg>
      );

    // 16. 완성된 선사 신궁 (The Complete Divine Bow & Arrow)
    case 'divine_bow':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          {/* Curved Bow Body */}
          <path d="M14 50 Q48 32 50 14" stroke="#a36224" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M14 50 Q48 32 50 14" stroke="#e6a455" strokeWidth="1.5" strokeLinecap="round" />
          {/* Taut Bowstring */}
          <line x1="14" y1="50" x2="50" y2="14" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 1" />
          {/* Nocked Arrow with Golden Gleam */}
          <line x1="18" y1="46" x2="46" y2="18" stroke="#ffeaa7" strokeWidth="2.5" />
          <polygon points="48,16 42,16 48,22" fill="#ffd32a" stroke="#d48806" strokeWidth="1" />
          {/* Center Grip */}
          <rect x="29" y="29" width="6" height="6" rx="1" fill="#4d2c0f" />
          {/* Sparkles */}
          <circle cx="50" cy="14" r="2" fill="#ffffff" />
          <circle cx="32" cy="32" r="1.5" fill="#ffeaa7" />
        </svg>
      );

    // 17. 마법의 토기 조각 1~5 (Magic Pottery Shards)
    case 'pottery_shard_1':
    case 'pottery_shard_2':
    case 'pottery_shard_3':
    case 'pottery_shard_4':
    case 'pottery_shard_5': {
      const shardShapes: Record<string, string> = {
        pottery_shard_1: 'M18 14 L46 14 L42 32 L24 30 Z',
        pottery_shard_2: 'M16 24 L36 20 L38 42 L18 44 Z',
        pottery_shard_3: 'M28 22 L48 26 L46 46 L26 42 Z',
        pottery_shard_4: 'M18 36 L34 34 L38 52 L22 52 Z',
        pottery_shard_5: 'M32 34 L48 36 L44 52 L30 52 Z',
      };
      const pathD = shardShapes[itemId] || shardShapes.pottery_shard_1;
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id={`shardGrad_${itemId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d98850" />
              <stop offset="55%" stopColor="#9e4d23" />
              <stop offset="100%" stopColor="#5e2a10" />
            </linearGradient>
          </defs>
          <path
            d={pathD}
            fill={`url(#shardGrad_${itemId})`}
            stroke="#ffd166"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {itemId === 'pottery_shard_1' && (
            <>
              <circle cx="26" cy="20" r="2" fill="#2b1206" />
              <circle cx="34" cy="20" r="2" fill="#2b1206" />
            </>
          )}
          <circle cx="32" cy="32" r="2.2" fill="#fff4c2" opacity="0.9" />
        </svg>
      );
    }

    // 18. 완성된 고강동 마법 토기 (Assembled Gogang Mumun Pottery)
    case 'magic_pottery':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <path
            d="M18 14 L46 14 C50 28 46 44 38 54 L26 54 C18 44 14 28 18 14 Z"
            fill="#a8562b"
            stroke="#ffd166"
            strokeWidth="2"
          />
          <ellipse cx="32" cy="14" rx="14" ry="4" fill="#6b3214" stroke="#ffd166" strokeWidth="1.5" />
          <circle cx="23" cy="21" r="1.5" fill="#2b1206" />
          <circle cx="29" cy="21.5" r="1.5" fill="#2b1206" />
          <circle cx="35" cy="21.5" r="1.5" fill="#2b1206" />
          <circle cx="41" cy="21" r="1.5" fill="#2b1206" />
          {/* Golden kintsugi cracks */}
          <path d="M22 28 L34 33 L44 26 M32 33 L28 48 M34 33 L40 46" stroke="#ffd166" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    // Default Fallback
    default:
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <circle cx="32" cy="32" r="20" fill="#4a3b32" stroke="#2b201a" strokeWidth="2" />
          <path d="M26 32 L38 32 M32 26 L32 38" stroke="#d4b59f" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};
