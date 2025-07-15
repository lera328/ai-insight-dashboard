import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Расширяем тип Session для включения дополнительных полей пользователя
   */
  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }

  /**
   * Расширяем тип User для включения дополнительных полей
   */
  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Расширяем тип JWT для включения дополнительных полей
   */
  interface JWT {
    role?: string;
  }
}
