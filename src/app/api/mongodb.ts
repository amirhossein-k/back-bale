// src\app\api\mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL!;

let cached = (global as any).mongoose;
if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}
export async function dbConnect() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false, // مهم: بافر را غیرفعال می‌کند تا فوراً خطا بدهد
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}


