import type { PromptLabel } from '../core/types';

// Two words at most: these are read by seven year olds mid-rush.
const TEXT: Record<PromptLabel, string> = {
  'take-dough': 'Take dough',
  'add-chips': 'Add chips',
  'load-oven': 'Bake it',
  'take-bun': 'Take bun',
  'ice-bun': 'Add cross',
  serve: 'Serve',
  'bin-it': 'Bin it',
};

export function promptText(label: PromptLabel): string {
  return TEXT[label];
}
