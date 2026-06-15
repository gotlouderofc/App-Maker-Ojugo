// Preset Icon Templates for Ojugo Gallery
export interface GalleryPreset {
  id: string;
  name: string;
  category: string;
  primaryColor: string;
  secondaryColor: string;
  svgPath: string;
}

export const GALLERY_PRESETS: GalleryPreset[] = [
  {
    id: 'chat',
    name: 'Ojugo Chat',
    category: 'Social',
    primaryColor: '#0284c7',
    secondaryColor: '#38bdf8',
    svgPath: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  {
    id: 'game',
    name: 'Retro Arcade',
    category: 'Games',
    primaryColor: '#f97316',
    secondaryColor: '#fdba74',
    svgPath: '<rect x="2" y="6" width="20" height="12" rx="2" ry="2" /><path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>'
  },
  {
    id: 'shop',
    name: 'Boutique Express',
    category: 'E-commerce',
    primaryColor: '#ec4899',
    secondaryColor: '#fbcfe8',
    svgPath: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  {
    id: 'music',
    name: 'SoundWave',
    category: 'Entertainment',
    primaryColor: '#8b5cf6',
    secondaryColor: '#ddd6fe',
    svgPath: '<path d="M9 18V5l12-2v13M9 10l12-2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'
  },
  {
    id: 'crypto',
    name: 'Coin Tracker',
    category: 'Finance',
    primaryColor: '#10b981',
    secondaryColor: '#a7f3d0',
    svgPath: '<circle cx="12" cy="12" r="10"/><path d="M12 8V6M12 18v-2M14.5 9h-3.5a1.5 1.5 0 0 0 0 3h3a1.5 1.5 0 0 1 0 3h-3.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  {
    id: 'edu',
    name: 'Study Lab',
    category: 'Education',
    primaryColor: '#06b6d4',
    secondaryColor: '#cffafe',
    svgPath: '<path d="M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c0 2 2.5 3 6 3s6-1 6-3v-5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  {
    id: 'health',
    name: 'Pulse & Fit',
    category: 'Health',
    primaryColor: '#ef4444',
    secondaryColor: '#fecaca',
    svgPath: '<path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  {
    id: 'news',
    name: 'Daily Press',
    category: 'News',
    primaryColor: '#4b5563',
    secondaryColor: '#e5e7eb',
    svgPath: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM16 8h2M16 12h2M16 16h2M6 8h6v8H6z" stroke-linecap="round" stroke-linejoin="round"/>'
  }
];

export function getSvgDataUrl(preset: GalleryPreset): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
    <rect width="100%" height="100%" fill="url(#grad-${preset.id})" rx="5"/>
    <defs>
      <linearGradient id="grad-${preset.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${preset.primaryColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${preset.secondaryColor};stop-opacity:1" />
      </linearGradient>
    </defs>
    <g transform="translate(3, 3) scale(0.75)">
      ${preset.svgPath}
    </g>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getDefaultIconUrl(name: string): string {
  const letter = (name ? name.charAt(0) : 'A').toUpperCase();
  const colorIndex = letter.charCodeAt(0) % 6;
  const colors = [
    { bg: '#0284c7', sub: '#0ea5e9' },
    { bg: '#f97316', sub: '#fb923c' },
    { bg: '#8b5cf6', sub: '#a78bfa' },
    { bg: '#ec4899', sub: '#f472b6' },
    { bg: '#10b981', sub: '#34d399' },
    { bg: '#ef4444', sub: '#f87171' }
  ];
  const { bg, sub } = colors[colorIndex];
  const preset: GalleryPreset = {
    id: `letter-${letter}`,
    name,
    category: 'Letter',
    primaryColor: bg,
    secondaryColor: sub,
    svgPath: `<text x="12" y="16" fill="white" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">${letter}</text>`
  };
  return getSvgDataUrl(preset);
}
