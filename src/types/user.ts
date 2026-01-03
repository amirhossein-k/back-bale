// src\types\user.ts
import { IUser } from "@/app/models/User";
import { Document } from "mongoose";


type DocumentKeys = keyof Document


export type UserModelType = Omit<IUser, DocumentKeys> & { _id: string }

export type OptionalUserModelType = Partial<UserModelType>;
