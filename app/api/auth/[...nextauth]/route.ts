import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Простой список тестовых пользователей
const users = [
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

// Упрощенная настройка NextAuth
const handler = NextAuth({
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

        const user = users.find(
          (user) => 
            user.email === credentials.email && 
            user.password === credentials.password
        );

        console.log('Login attempt:', credentials.email, user ? 'success' : 'failed');
        
        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
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

