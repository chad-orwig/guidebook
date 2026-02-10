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

export function getColorClasses(color: TailwindColor | undefined): string {
  if (!color) return 'bg-gray-500';

  return colorClassMap[color.hue]?.[color.shade] || 'bg-gray-500';
}
