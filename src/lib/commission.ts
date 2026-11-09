/**
 * Platform Commission & Seller Settlement Engine
 * Handles automated calculation, deduction, and tracking of BIDME platform fees.
 */

export const DEFAULT_COMMISSION_RATE = 0.05; // 5% default marketplace fee

export interface CommissionBreakdown {
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netSellerAmount: number;
}

export function calculateCommission(
  grossAmount: number,
  rate: number = DEFAULT_COMMISSION_RATE
): CommissionBreakdown {
  const commissionRate = rate;
  const commissionAmount = Math.round(grossAmount * commissionRate);
  const netSellerAmount = grossAmount - commissionAmount;

  return {
    grossAmount,
    commissionRate,
    commissionAmount,
    netSellerAmount,
  };
}

export function formatCommissionSummary(breakdown: CommissionBreakdown): string {
  return `Sale: Rs. ${breakdown.grossAmount.toLocaleString("en-LK")} | Platform Fee (${(breakdown.commissionRate * 100).toFixed(0)}%): Rs. ${breakdown.commissionAmount.toLocaleString("en-LK")} | Seller Payout: Rs. ${breakdown.netSellerAmount.toLocaleString("en-LK")}`;
}
