import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";

// Простой список тестовых пользователей для начальной инициализации
const defaultUsers = [
  {
    id: "1",
    name: "Администратор",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: "2",
    name: "Пользователь",
    email: "user@example.com",
    password: "user123",
    role: "user",
  },
];

// Функция для проверки и создания тестовых пользователей в БД
async function initializeDefaultUsers() {
  for (const user of defaultUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          // Хешируем пароль для безопасного хранения
          password: await hash(user.password, 10),
        },
      });
      console.log(`Created default user: ${user.email}`);
    }
  }
}

// Инициализируем пользователей при старте приложения
// Оборачиваем в функцию для использования в async/await
(async () => {
  try {
    console.log("Initializing default users...");
    await initializeDefaultUsers();
    console.log("Default users initialization complete.");
  } catch (error) {
    console.error("Error initializing users:", error);
  }
})();

// Настройка NextAuth с использованием Prisma адаптера
const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        // Ищем пользователя в базе данных по email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          console.log('User not found or has no password');
          return null;
        }

        // Проверяем хеш пароля
        const isPasswordValid = await compare(credentials.password, user.password);
        
        console.log('Login attempt:', credentials.email, isPasswordValid ? 'success' : 'failed');
        
        if (isPasswordValid) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image
          };
        }
        
        return null;
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 день
  },
  
  // Используем фиксированный секретный ключ для разработки
  secret: "development-secret-key-do-not-use-in-production",
  
  // Включаем режим отладки для локальной разработки
  debug: true,
});

export { handler as GET, handler as POST };

