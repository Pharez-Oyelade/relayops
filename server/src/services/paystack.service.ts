import crypto from "crypto";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number; // in kobo / minor units
    gateway_response: string;
    paid_at?: string;
    channel: string;
    currency: string;
    metadata?: Record<string, any>;
    customer?: {
      id: number;
      email: string;
      customer_code: string;
    };
  };
}

export class PaystackService {
  /**
   * Verifies an inline transaction reference directly with the Paystack REST API
   */
  static async verifyTransaction(
    reference: string,
  ): Promise<PaystackVerifyResponse> {
    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const json = (await response.json()) as PaystackVerifyResponse;

      if (!response.ok || !json.status) {
        throw new AppError(
          json.message || "Failed to verify transaction with Paystack",
          400,
          "PAYSTACK_VERIFY_ERROR",
        );
      }

      return json;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Paystack verification network error: ${error?.message || "Unknown error"}`,
        500,
        "PAYSTACK_NETWORK_ERROR",
      );
    }
  }

  /**
   * Verifies the authenticity of incoming Paystack webhook requests using HMAC SHA-512
   */
  static verifyWebhookSignature(
    rawBody: Buffer | string,
    signatureHeader: string | undefined,
  ): boolean {
    if (!signatureHeader) return false;

    const hash = crypto
      .createHmac("sha512", env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    return hash === signatureHeader;
  }
}
