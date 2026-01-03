// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";


declare module "next-auth" {
       interface Session {
              user: {
                     id?: string;              // ✅ اضافه شد

                     phoneNumber?: string;
                     codeYekta?: string;

              } & DefaultSession["user"];
       }

       interface User extends DefaultUser {
              phoneNumber?: string;
              codeYekta?: string;
       }
}

declare module "next-auth/jwt" {
       interface JWT {
              user?: {
                     id?: string;
                     phoneNumber?: string;
                     codeYekta?: string;
              };
       }
}
