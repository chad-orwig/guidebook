import type { TailwindColor } from '@guidebook/models';

// Complete class mapping so Tailwind JIT can detect them
const colorClassMap: Record<string, Record<string, string>> = {
  red: {
    '200': 'bg-red-200', '300': 'bg-red-300', '400': 'bg-red-400', '500': 'bg-red-500',
    '600': 'bg-red-600', '700': 'bg-red-700', '800': 'bg-red-800', '900': 'bg-red-900',
  },
  orange: {
    '200': 'bg-orange-200', '300': 'bg-orange-300', '400': 'bg-orange-400', '500': 'bg-orange-500',
    '600': 'bg-orange-600', '700': 'bg-orange-700', '800': 'bg-orange-800', '900': 'bg-orange-900',
  },
  amber: {
    '200': 'bg-amber-200', '300': 'bg-amber-300', '400': 'bg-amber-400', '500': 'bg-amber-500',
    '600': 'bg-amber-600', '700': 'bg-amber-700', '800': 'bg-amber-800', '900': 'bg-amber-900',
  },
  yellow: {
    '200': 'bg-yellow-200', '300': 'bg-yellow-300', '400': 'bg-yellow-400', '500': 'bg-yellow-500',
    '600': 'bg-yellow-600', '700': 'bg-yellow-700', '800': 'bg-yellow-800', '900': 'bg-yellow-900',
  },
  lime: {
    '200': 'bg-lime-200', '300': 'bg-lime-300', '400': 'bg-lime-400', '500': 'bg-lime-500',
    '600': 'bg-lime-600', '700': 'bg-lime-700', '800': 'bg-lime-800', '900': 'bg-lime-900',
  },
  green: {
    '200': 'bg-green-200', '300': 'bg-green-300', '400': 'bg-green-400', '500': 'bg-green-500',
    '600': 'bg-green-600', '700': 'bg-green-700', '800': 'bg-green-800', '900': 'bg-green-900',
  },
  emerald: {
    '200': 'bg-emerald-200', '300': 'bg-emerald-300', '400': 'bg-emerald-400', '500': 'bg-emerald-500',
    '600': 'bg-emerald-600', '700': 'bg-emerald-700', '800': 'bg-emerald-800', '900': 'bg-emerald-900',
  },
  teal: {
    '200': 'bg-teal-200', '300': 'bg-teal-300', '400': 'bg-teal-400', '500': 'bg-teal-500',
    '600': 'bg-teal-600', '700': 'bg-teal-700', '800': 'bg-teal-800', '900': 'bg-teal-900',
  },
  cyan: {
    '200': 'bg-cyan-200', '300': 'bg-cyan-300', '400': 'bg-cyan-400', '500': 'bg-cyan-500',
    '600': 'bg-cyan-600', '700': 'bg-cyan-700', '800': 'bg-cyan-800', '900': 'bg-cyan-900',
  },
  sky: {
    '200': 'bg-sky-200', '300': 'bg-sky-300', '400': 'bg-sky-400', '500': 'bg-sky-500',
    '600': 'bg-sky-600', '700': 'bg-sky-700', '800': 'bg-sky-800', '900': 'bg-sky-900',
  },
  blue: {
    '200': 'bg-blue-200', '300': 'bg-blue-300', '400': 'bg-blue-400', '500': 'bg-blue-500',
    '600': 'bg-blue-600', '700': 'bg-blue-700', '800': 'bg-blue-800', '900': 'bg-blue-900',
  },
  indigo: {
    '200': 'bg-indigo-200', '300': 'bg-indigo-300', '400': 'bg-indigo-400', '500': 'bg-indigo-500',
    '600': 'bg-indigo-600', '700': 'bg-indigo-700', '800': 'bg-indigo-800', '900': 'bg-indigo-900',
  },
  violet: {
    '200': 'bg-violet-200', '300': 'bg-violet-300', '400': 'bg-violet-400', '500': 'bg-violet-500',
    '600': 'bg-violet-600', '700': 'bg-violet-700', '800': 'bg-violet-800', '900': 'bg-violet-900',
  },
  purple: {
    '200': 'bg-purple-200', '300': 'bg-purple-300', '400': 'bg-purple-400', '500': 'bg-purple-500',
    '600': 'bg-purple-600', '700': 'bg-purple-700', '800': 'bg-purple-800', '900': 'bg-purple-900',
  },
  fuchsia: {
    '200': 'bg-fuchsia-200', '300': 'bg-fuchsia-300', '400': 'bg-fuchsia-400', '500': 'bg-fuchsia-500',
    '600': 'bg-fuchsia-600', '700': 'bg-fuchsia-700', '800': 'bg-fuchsia-800', '900': 'bg-fuchsia-900',
  },
  pink: {
    '200': 'bg-pink-200', '300': 'bg-pink-300', '400': 'bg-pink-400', '500': 'bg-pink-500',
    '600': 'bg-pink-600', '700': 'bg-pink-700', '800': 'bg-pink-800', '900': 'bg-pink-900',
  },
  rose: {
    '200': 'bg-rose-200', '300': 'bg-rose-300', '400': 'bg-rose-400', '500': 'bg-rose-500',
    '600': 'bg-rose-600', '700': 'bg-rose-700', '800': 'bg-rose-800', '900': 'bg-rose-900',
  },
  gray: {
    '200': 'bg-gray-200', '300': 'bg-gray-300', '400': 'bg-gray-400', '500': 'bg-gray-500',
    '600': 'bg-gray-600', '700': 'bg-gray-700', '800': 'bg-gray-800', '900': 'bg-gray-900',
  },
};

// Text color class mapping so Tailwind JIT can detect them
const textColorClassMap: Record<string, Record<string, string>> = {
  red: {
    '200': 'text-red-200', '300': 'text-red-300', '400': 'text-red-400', '500': 'text-red-500',
    '600': 'text-red-600', '700': 'text-red-700', '800': 'text-red-800', '900': 'text-red-900',
  },
  orange: {
    '200': 'text-orange-200', '300': 'text-orange-300', '400': 'text-orange-400', '500': 'text-orange-500',
    '600': 'text-orange-600', '700': 'text-orange-700', '800': 'text-orange-800', '900': 'text-orange-900',
  },
  amber: {
    '200': 'text-amber-200', '300': 'text-amber-300', '400': 'text-amber-400', '500': 'text-amber-500',
    '600': 'text-amber-600', '700': 'text-amber-700', '800': 'text-amber-800', '900': 'text-amber-900',
  },
  yellow: {
    '200': 'text-yellow-200', '300': 'text-yellow-300', '400': 'text-yellow-400', '500': 'text-yellow-500',
    '600': 'text-yellow-600', '700': 'text-yellow-700', '800': 'text-yellow-800', '900': 'text-yellow-900',
  },
  lime: {
    '200': 'text-lime-200', '300': 'text-lime-300', '400': 'text-lime-400', '500': 'text-lime-500',
    '600': 'text-lime-600', '700': 'text-lime-700', '800': 'text-lime-800', '900': 'text-lime-900',
  },
  green: {
    '200': 'text-green-200', '300': 'text-green-300', '400': 'text-green-400', '500': 'text-green-500',
    '600': 'text-green-600', '700': 'text-green-700', '800': 'text-green-800', '900': 'text-green-900',
  },
  emerald: {
    '200': 'text-emerald-200', '300': 'text-emerald-300', '400': 'text-emerald-400', '500': 'text-emerald-500',
    '600': 'text-emerald-600', '700': 'text-emerald-700', '800': 'text-emerald-800', '900': 'text-emerald-900',
  },
  teal: {
    '200': 'text-teal-200', '300': 'text-teal-300', '400': 'text-teal-400', '500': 'text-teal-500',
    '600': 'text-teal-600', '700': 'text-teal-700', '800': 'text-teal-800', '900': 'text-teal-900',
  },
  cyan: {
    '200': 'text-cyan-200', '300': 'text-cyan-300', '400': 'text-cyan-400', '500': 'text-cyan-500',
    '600': 'text-cyan-600', '700': 'text-cyan-700', '800': 'text-cyan-800', '900': 'text-cyan-900',
  },
  sky: {
    '200': 'text-sky-200', '300': 'text-sky-300', '400': 'text-sky-400', '500': 'text-sky-500',
    '600': 'text-sky-600', '700': 'text-sky-700', '800': 'text-sky-800', '900': 'text-sky-900',
  },
  blue: {
    '200': 'text-blue-200', '300': 'text-blue-300', '400': 'text-blue-400', '500': 'text-blue-500',
    '600': 'text-blue-600', '700': 'text-blue-700', '800': 'text-blue-800', '900': 'text-blue-900',
  },
  indigo: {
    '200': 'text-indigo-200', '300': 'text-indigo-300', '400': 'text-indigo-400', '500': 'text-indigo-500',
    '600': 'text-indigo-600', '700': 'text-indigo-700', '800': 'text-indigo-800', '900': 'text-indigo-900',
  },
  violet: {
    '200': 'text-violet-200', '300': 'text-violet-300', '400': 'text-violet-400', '500': 'text-violet-500',
    '600': 'text-violet-600', '700': 'text-violet-700', '800': 'text-violet-800', '900': 'text-violet-900',
  },
  purple: {
    '200': 'text-purple-200', '300': 'text-purple-300', '400': 'text-purple-400', '500': 'text-purple-500',
    '600': 'text-purple-600', '700': 'text-purple-700', '800': 'text-purple-800', '900': 'text-purple-900',
  },
  fuchsia: {
    '200': 'text-fuchsia-200', '300': 'text-fuchsia-300', '400': 'text-fuchsia-400', '500': 'text-fuchsia-500',
    '600': 'text-fuchsia-600', '700': 'text-fuchsia-700', '800': 'text-fuchsia-800', '900': 'text-fuchsia-900',
  },
  pink: {
    '200': 'text-pink-200', '300': 'text-pink-300', '400': 'text-pink-400', '500': 'text-pink-500',
    '600': 'text-pink-600', '700': 'text-pink-700', '800': 'text-pink-800', '900': 'text-pink-900',
  },
  rose: {
    '200': 'text-rose-200', '300': 'text-rose-300', '400': 'text-rose-400', '500': 'text-rose-500',
    '600': 'text-rose-600', '700': 'text-rose-700', '800': 'text-rose-800', '900': 'text-rose-900',
  },
  gray: {
    '200': 'text-gray-200', '300': 'text-gray-300', '400': 'text-gray-400', '500': 'text-gray-500',
    '600': 'text-gray-600', '700': 'text-gray-700', '800': 'text-gray-800', '900': 'text-gray-900',
  },
};

export function getColorClasses(color: TailwindColor | undefined): string {
  if (!color) return 'bg-gray-500';

  return colorClassMap[color.hue]?.[color.shade] || 'bg-gray-500';
}

export function getTextColorClasses(color: TailwindColor | undefined): string {
  if (!color) return 'text-violet-700';

  return textColorClassMap[color.hue]?.[color.shade] || 'text-violet-700';
}

// RGB values for Tailwind colors (approximate, from Tailwind's palette)
const tailwindRgbMap: Record<string, Record<string, [number, number, number]>> = {
  red: { '200': [254, 202, 202], '300': [252, 165, 165], '400': [248, 113, 113], '500': [239, 68, 68], '600': [220, 38, 38], '700': [185, 28, 28], '800': [153, 27, 27], '900': [127, 29, 29] },
  orange: { '200': [254, 215, 170], '300': [253, 186, 116], '400': [251, 146, 60], '500': [249, 115, 22], '600': [234, 88, 12], '700': [194, 65, 12], '800': [154, 52, 18], '900': [124, 45, 18] },
  amber: { '200': [253, 230, 138], '300': [252, 211, 77], '400': [251, 191, 36], '500': [245, 158, 11], '600': [217, 119, 6], '700': [180, 83, 9], '800': [146, 64, 14], '900': [120, 53, 15] },
  yellow: { '200': [254, 240, 138], '300': [253, 224, 71], '400': [250, 204, 21], '500': [234, 179, 8], '600': [202, 138, 4], '700': [161, 98, 7], '800': [133, 77, 14], '900': [113, 63, 18] },
  lime: { '200': [217, 249, 157], '300': [190, 242, 100], '400': [163, 230, 53], '500': [132, 204, 22], '600': [101, 163, 13], '700': [77, 124, 15], '800': [63, 98, 18], '900': [54, 83, 20] },
  green: { '200': [187, 247, 208], '300': [134, 239, 172], '400': [74, 222, 128], '500': [34, 197, 94], '600': [22, 163, 74], '700': [21, 128, 61], '800': [22, 101, 52], '900': [20, 83, 45] },
  emerald: { '200': [167, 243, 208], '300': [110, 231, 183], '400': [52, 211, 153], '500': [16, 185, 129], '600': [5, 150, 105], '700': [4, 120, 87], '800': [6, 95, 70], '900': [6, 78, 59] },
  teal: { '200': [153, 246, 228], '300': [94, 234, 212], '400': [45, 212, 191], '500': [20, 184, 166], '600': [13, 148, 136], '700': [15, 118, 110], '800': [17, 94, 89], '900': [19, 78, 74] },
  cyan: { '200': [165, 243, 252], '300': [103, 232, 249], '400': [34, 211, 238], '500': [6, 182, 212], '600': [8, 145, 178], '700': [14, 116, 144], '800': [21, 94, 117], '900': [22, 78, 99] },
  sky: { '200': [186, 230, 253], '300': [125, 211, 252], '400': [56, 189, 248], '500': [14, 165, 233], '600': [2, 132, 199], '700': [3, 105, 161], '800': [7, 89, 133], '900': [12, 74, 110] },
  blue: { '200': [191, 219, 254], '300': [147, 197, 253], '400': [96, 165, 250], '500': [59, 130, 246], '600': [37, 99, 235], '700': [29, 78, 216], '800': [30, 64, 175], '900': [30, 58, 138] },
  indigo: { '200': [199, 210, 254], '300': [165, 180, 252], '400': [129, 140, 248], '500': [99, 102, 241], '600': [79, 70, 229], '700': [67, 56, 202], '800': [55, 48, 163], '900': [49, 46, 129] },
  violet: { '200': [221, 214, 254], '300': [196, 181, 253], '400': [167, 139, 250], '500': [139, 92, 246], '600': [124, 58, 237], '700': [109, 40, 217], '800': [91, 33, 182], '900': [76, 29, 149] },
  purple: { '200': [233, 213, 255], '300': [216, 180, 254], '400': [192, 132, 252], '500': [168, 85, 247], '600': [147, 51, 234], '700': [126, 34, 206], '800': [107, 33, 168], '900': [88, 28, 135] },
  fuchsia: { '200': [245, 208, 254], '300': [240, 171, 252], '400': [232, 121, 249], '500': [217, 70, 239], '600': [192, 38, 211], '700': [162, 28, 175], '800': [134, 25, 143], '900': [112, 26, 117] },
  pink: { '200': [251, 207, 232], '300': [249, 168, 212], '400': [244, 114, 182], '500': [236, 72, 153], '600': [219, 39, 119], '700': [190, 24, 93], '800': [157, 23, 77], '900': [131, 24, 67] },
  rose: { '200': [254, 205, 211], '300': [253, 164, 175], '400': [251, 113, 133], '500': [244, 63, 94], '600': [225, 29, 72], '700': [190, 18, 60], '800': [159, 18, 57], '900': [136, 19, 55] },
  gray: { '200': [229, 231, 235], '300': [209, 213, 219], '400': [156, 163, 175], '500': [107, 114, 128], '600': [75, 85, 99], '700': [55, 65, 81], '800': [31, 41, 55], '900': [17, 24, 39] },
};

// Calculate relative luminance
function getLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(val => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate contrast ratio between two colors
function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Check if a color is light (luminance > 0.5)
function isLightColor(rgb: [number, number, number]): boolean {
  return getLuminance(rgb) > 0.5;
}

// Get text color with sufficient contrast against background
export function getContrastTextColor(
  backgroundColor: TailwindColor | undefined,
  secondaryColors: TailwindColor[] | undefined
): string {
  if (!backgroundColor) return 'text-violet-800';

  const bgRgb = tailwindRgbMap[backgroundColor.hue]?.[backgroundColor.shade];
  if (!bgRgb) return 'text-violet-800';

  // Try each secondary color
  if (secondaryColors && secondaryColors.length > 0) {
    for (const color of secondaryColors) {
      const colorRgb = tailwindRgbMap[color.hue]?.[color.shade];
      if (colorRgb) {
        const contrast = getContrastRatio(bgRgb, colorRgb);
        // WCAG AA standard requires 4.5:1 for normal text
        // But this is for a 7 year old
        if (contrast >= 2.5) {
          return getTextColorClasses(color);
        }
      }
    }
  }

  // No secondary color has sufficient contrast, use violet based on background lightness
  const isLight = isLightColor(bgRgb);
  return isLight ? 'text-violet-800' : 'text-violet-100';
}
