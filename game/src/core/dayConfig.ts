import { z } from 'zod';
import type { DayConfig } from './types';

/**
 * The day-file schema from spec 7.5. Every file in src/data/days is parsed
 * through this at import time (so a bad file fails on startup, in
 * development and in the test), and the test in dayConfig.test.ts covers
 * every file explicitly. Zod 4 API: z.object, z.enum, z.literal,
 * z.discriminatedUnion, z.tuple, .nullable(), .refine().
 */
const CustomerIdSchema = z.enum(['george', 'suzy', 'danny', 'grandpa']);

const DayEndSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('customers'), count: z.number().int().positive() }),
  z.object({ type: z.literal('time'), seconds: z.number().positive() }),
]);

export const DayConfigSchema: z.ZodType<DayConfig> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  twist: z.string().min(1),
  end: DayEndSchema,
  customers: z.array(CustomerIdSchema).min(1),
  maxOrderSize: z.number().int().min(1).max(3),
  maxQueue: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  spawnGapSeconds: z
    .tuple([z.number().nonnegative(), z.number().nonnegative()])
    .refine(([lo, hi]) => lo <= hi, { message: 'spawnGapSeconds must be [low, high] with low <= high' }),
  chipChance: z.number().min(0).max(1),
  bakeSeconds: z.number().positive(),
  burnWindowSeconds: z.number().positive().nullable(),
  patienceMultiplier: z.number().positive(),
  tutorial: z.boolean(),
  stars: z
    .tuple([z.number().nonnegative(), z.number().nonnegative(), z.number().nonnegative()])
    .refine(([one, two, three]) => one < two && two < three, { message: 'stars must increase' }),
});

// Throws a ZodError whose message lists every failing path.
export function parseDayConfig(input: unknown): DayConfig {
  return DayConfigSchema.parse(input);
}
