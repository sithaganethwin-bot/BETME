import crypto from "crypto";

export interface PayHereParams {
  merchantId: string;
  orderId: string;
  amount: number;
  currency: string;
  merchantSecret: string;
}

export function generatePayHereHash({
  merchantId,
  orderId,
  amount,
  currency = "LKR",
  merchantSecret,
}: PayHereParams): string {
  const formattedAmount = Number(amount).toFixed(2);
  const secretHash = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const hashString = `${merchantId}${orderId}${formattedAmount}${currency}${secretHash}`;
  return crypto.createHash("md5").update(hashString).digest("hex").toUpperCase();
}

export function verifyPayHereNotification({
  merchantId,
  orderId,
  payhereAmount,
  payhereCurrency,
  statusCode,
  md5sig,
  merchantSecret,
}: {
  merchantId: string;
  orderId: string;
  payhereAmount: string;
  payhereCurrency: string;
  statusCode: string;
  md5sig: string;
  merchantSecret: string;
}): boolean {
  const secretHash = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const calculated = crypto
    .createHash("md5")
    .update(`${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${secretHash}`)
    .digest("hex")
    .toUpperCase();

  return calculated === md5sig.toUpperCase();
}
