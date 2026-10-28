// Credit packs a store can buy. Price per credit comes from CREDIT_PRICE_PAISE.
export const CREDIT_PACKS = [10, 50, 200] as const;
export type CreditPack = (typeof CREDIT_PACKS)[number];

export function isCreditPack(creditCount: number): creditCount is CreditPack {
  return (CREDIT_PACKS as readonly number[]).includes(creditCount);
}

// Each QR code creation (static or dynamic) costs one credit.
export const CREDITS_PER_CODE = 1;
