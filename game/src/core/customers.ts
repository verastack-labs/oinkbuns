import raw from '../data/customers.json';
import type { CustomerDef, CustomerId } from './types';

/**
 * The customer table (spec 5.5) as typed data. The JSON import is typed by
 * TypeScript with `id: string`; the cast narrows it to the contract type,
 * which is safe because the file is part of this package and the day-file
 * test checks every day's customer ids against this record.
 */
export const CUSTOMERS: Record<CustomerId, CustomerDef> = raw as Record<CustomerId, CustomerDef>;

export function customerDef(id: CustomerId): CustomerDef {
  return CUSTOMERS[id];
}
