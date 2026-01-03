import mongoose from "mongoose";


export interface walletsType {
       _id: mongoose.Schema.Types.ObjectId

       userId: string
       buildingId:
       mongoose.Schema.Types.ObjectId

       balance: number
       totalDeposited: number
       totalWithdrawn: number
       lastTransactionAt?: Date,
       createdAt: Date
       updatedAt: Date
       status: 'pending' | 'completed' | 'failed'
}
