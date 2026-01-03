

export interface Charge {
    _id: string;
    buildingId: any
    title: string;
    year: number;
    month: number;
    totalAmount: number;
    dueDate: Date;
    status: string
    isFullyPaid: boolean
    createdAt: Date
    targetMembers: string[];
}
