/** طريقة عرض صورة الوجه داخل الكرت */
export type CardImageFit = 'contain' | 'cover';

export interface BoardLayoutProfile {
  /** مفتاح CSS: td-board-layout--{layoutKey} */
  readonly layoutKey: string;
  readonly gapPx: number;
  readonly imageFit: CardImageFit;
  readonly imagePosition: string;
  /** حشوة داخل وجه الكرت حول الصورة */
  readonly photoInset: string;
  readonly faceBackground: string;
  readonly backInset: string;
  /** 0.75–1 — تصغير طفيف للشبكات الممطوطة (2×5، 6×2…) */
  readonly cellScale: number;
}

/** طريقة حساب حجم الخلية حسب شكل الشبكة */
export type GridShapeMode = 'balanced' | 'width-led' | 'height-led';

export function getGridShapeMode(rows: number, cols: number): GridShapeMode {
  const r = Math.max(1, Math.floor(rows));
  const c = Math.max(1, Math.floor(cols));
  if (r >= c * 2) {
    return 'width-led';
  }
  if (c >= r * 2) {
    return 'height-led';
  }
  return 'balanced';
}

function cellScaleForGridShape(rows: number, cols: number): number {
  const ratio = Math.max(rows, cols) / Math.min(rows, cols);
  if (ratio >= 2) {
    return 0.97;
  }
  return 1;
}

type BoardLayoutDef = Omit<BoardLayoutProfile, 'cellScale'> & { readonly cellScale?: number };

function normalizeBoardLayout(def: BoardLayoutDef, rows: number, cols: number): BoardLayoutProfile {
  return {
    ...def,
    cellScale: def.cellScale ?? cellScaleForGridShape(rows, cols)
  };
}

const DEFAULT_FACE_BG =
  'color-mix(in srgb, var(--bg-card) 72%, var(--accent-purple) 8%)';

/** إعدادات مُحسَّنة لكل تقسيمة شائعة (صفوف × أعمدة) */
const BOARD_LAYOUT_BY_KEY: Readonly<Record<string, BoardLayoutDef>> = {
  '2x2': {
    layoutKey: '2x2',
    gapPx: 14,
    imageFit: 'contain',
    imagePosition: 'center center',
    photoInset: '10px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.45rem'
  },
  '2x3': {
    layoutKey: '2x3',
    gapPx: 12,
    imageFit: 'contain',
    imagePosition: 'center center',
    photoInset: '9px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.4rem'
  },
  '3x2': {
    layoutKey: '3x2',
    gapPx: 12,
    imageFit: 'contain',
    imagePosition: 'center center',
    photoInset: '9px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.4rem'
  },
  '2x4': {
    layoutKey: '2x4',
    gapPx: 11,
    imageFit: 'contain',
    imagePosition: 'center 12%',
    photoInset: '8px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.35rem',
    cellScale: 0.9
  },
  '2x5': {
    layoutKey: '2x5',
    gapPx: 8,
    imageFit: 'cover',
    imagePosition: 'center 22%',
    photoInset: '3px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.28rem',
    cellScale: 1
  },
  '2x6': {
    layoutKey: '2x6',
    gapPx: 9,
    imageFit: 'cover',
    imagePosition: 'center 22%',
    photoInset: '3px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.26rem',
    cellScale: 0.98
  },
  '5x2': {
    layoutKey: '5x2',
    gapPx: 10,
    imageFit: 'cover',
    imagePosition: 'center center',
    photoInset: '3px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.28rem',
    cellScale: 1
  },
  '6x2': {
    layoutKey: '6x2',
    gapPx: 9,
    imageFit: 'cover',
    imagePosition: 'center center',
    photoInset: '3px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.26rem',
    cellScale: 0.98
  },
  '4x2': {
    layoutKey: '4x2',
    gapPx: 11,
    imageFit: 'contain',
    imagePosition: 'center center',
    photoInset: '8px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.35rem'
  },
  '3x4': {
    layoutKey: '3x4',
    gapPx: 10,
    imageFit: 'contain',
    imagePosition: 'center 14%',
    photoInset: '7px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.32rem'
  },
  '4x3': {
    layoutKey: '4x3',
    gapPx: 10,
    imageFit: 'contain',
    imagePosition: 'center center',
    photoInset: '7px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.32rem'
  },
  '4x4': {
    layoutKey: '4x4',
    gapPx: 10,
    imageFit: 'contain',
    imagePosition: 'center 16%',
    photoInset: '6px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.3rem'
  },
  '3x6': {
    layoutKey: '3x6',
    gapPx: 8,
    imageFit: 'contain',
    imagePosition: 'center 12%',
    photoInset: '5px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.28rem'
  },
  '6x3': {
    layoutKey: '6x3',
    gapPx: 8,
    imageFit: 'contain',
    imagePosition: 'center center',
    photoInset: '5px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.28rem'
  },
  '4x6': {
    layoutKey: '4x6',
    gapPx: 7,
    imageFit: 'contain',
    imagePosition: 'center 14%',
    photoInset: '4px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.24rem'
  },
  '6x4': {
    layoutKey: '6x4',
    gapPx: 7,
    imageFit: 'contain',
    imagePosition: 'center center',
    photoInset: '4px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.24rem'
  },
  '5x6': {
    layoutKey: '5x6',
    gapPx: 6,
    imageFit: 'contain',
    imagePosition: 'center 15%',
    photoInset: '3px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.22rem'
  },
  '6x5': {
    layoutKey: '6x5',
    gapPx: 6,
    imageFit: 'contain',
    imagePosition: 'center center',
    photoInset: '3px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.22rem'
  },
  '6x6': {
    layoutKey: '6x6',
    gapPx: 5,
    imageFit: 'contain',
    imagePosition: 'center 18%',
    photoInset: '2px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.2rem'
  }
};

function imageFitForShape(rows: number, cols: number): CardImageFit {
  return Math.max(rows, cols) / Math.min(rows, cols) >= 2 ? 'cover' : 'contain';
}

function imagePositionForShape(rows: number, cols: number): string {
  if (rows > cols) {
    return 'center 22%';
  }
  if (cols > rows) {
    return 'center center';
  }
  return 'center center';
}

function resolveBoardLayoutByCells(
  cells: number,
  rows: number,
  cols: number
): BoardLayoutDef {
  const key = `cells-${cells}`;
  const fit = imageFitForShape(rows, cols);
  const position = imagePositionForShape(rows, cols);

  if (cells <= 4) {
    return {
      layoutKey: key,
      gapPx: 14,
      imageFit: fit,
      imagePosition: position,
      photoInset: fit === 'cover' ? '3px' : '10px',
      faceBackground: DEFAULT_FACE_BG,
      backInset: '0.45rem'
    };
  }

  if (cells <= 8) {
    return {
      layoutKey: key,
      gapPx: 12,
      imageFit: fit,
      imagePosition: position,
      photoInset: fit === 'cover' ? '3px' : '8px',
      faceBackground: DEFAULT_FACE_BG,
      backInset: '0.38rem'
    };
  }

  if (cells <= 16) {
    return {
      layoutKey: key,
      gapPx: 10,
      imageFit: fit,
      imagePosition: position,
      photoInset: fit === 'cover' ? '3px' : '6px',
      faceBackground: DEFAULT_FACE_BG,
      backInset: '0.3rem'
    };
  }

  if (cells <= 24) {
    return {
      layoutKey: key,
      gapPx: 8,
      imageFit: fit,
      imagePosition: position,
      photoInset: fit === 'cover' ? '2px' : '4px',
      faceBackground: DEFAULT_FACE_BG,
      backInset: '0.26rem'
    };
  }

  return {
    layoutKey: key,
    gapPx: 6,
    imageFit: fit,
    imagePosition: position,
    photoInset: '2px',
    faceBackground: DEFAULT_FACE_BG,
    backInset: '0.22rem'
  };
}

export function getBoardLayout(rows: number, cols: number): BoardLayoutProfile {
  const r = Math.max(1, Math.floor(rows));
  const c = Math.max(1, Math.floor(cols));
  const key = `${r}x${c}`;
  const def = BOARD_LAYOUT_BY_KEY[key] ?? resolveBoardLayoutByCells(r * c, r, c);
  return normalizeBoardLayout(def, r, c);
}

/** متغيرات CSS للوحة والكروت */
export function boardLayoutStyleVars(
  layout: BoardLayoutProfile,
  rows: number,
  cols: number
): Record<string, string> {
  return {
    '--board-rows': String(Math.max(1, Math.floor(rows))),
    '--board-cols': String(Math.max(1, Math.floor(cols))),
    '--td-grid-gap': `${layout.gapPx}px`,
    '--td-card-image-fit': layout.imageFit,
    '--td-card-image-position': layout.imagePosition,
    '--td-card-photo-inset': layout.photoInset,
    '--td-card-face-bg': layout.faceBackground,
    '--td-card-back-inset': layout.backInset,
    '--td-cell-scale': String(layout.cellScale)
  };
}
