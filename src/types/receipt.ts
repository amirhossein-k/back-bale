// types/receipt.ts
export interface SaveReceiptToBaleInput {
    userId: string;
    buildingId: string;
    fileId: string;
    caption?: string;
    chatId?: number;
    amount?: number;
}

export interface PaymentDocument {
    _id: string;
    userId: string;
    buildingId: string;
    fileId: string;
    fileUrl: string;
    caption: string;
    chatId?: number;
    amount: number;
    status: 'pending' | 'verified' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
    verifiedAt: Date | null;
    verifiedBy: string | null;
    adminNote: string | null;
}
