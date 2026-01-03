// types/index.ts

import { JSX } from "react";

export interface Plan {
       id: string;
       name: string;
       price: number;
       period: string;
       description: string;
       features: string[];
       // isActive: boolean;
       icon: any
       // badge: 'popular' | 'best' | null;
}

export interface Purchase {
       purchaseId: string;
       activationCode: string;
       amount: number;
       planName: string;
       planId?: string;
       phoneNumber: string;
       status: 'pending' | 'paid' | 'failed' | 'expired';
       transactionId?: string | null;
       paidAt?: string | null;
       expiresAt?: string;
       paymentGateway: string
       userId: any
       paygiri: string
       verified: boolean
}

export interface PaymentRequestResponse {
       paymentUrl: string;
       transId: string;
}

export interface ApiResponse<T = unknown> {
       success: boolean;
       message?: string;
       data?: T;
}

export interface CreatePurchaseInput {
       planId: string;
       phoneNumber: string;
}

export interface VerifyPaymentInput {
       transId: string;
       purchaseId: string;
}
