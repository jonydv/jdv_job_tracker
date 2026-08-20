import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/server/db"
import { env } from "@/lib/env"

export const googleConfigured = Boolean(
  env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
)
export const devLoginEnabled = env.NODE_ENV !== "production"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: env.AUTH_GOOGLE_ID,
            clientSecret: env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    ...(devLoginEnabled
      ? [
          Credentials({
            id: "dev",
            name: "Dev login",
            credentials: {
              email: { label: "Email", type: "email" },
            },
            async authorize(credentials) {
              const email =
                typeof credentials?.email === "string"
                  ? credentials.email.trim().toLowerCase()
                  : undefined

              if (!email) return null

              return prisma.user.upsert({
                where: { email },
                update: {},
                create: { email, name: email.split("@")[0] },
              })
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id
        token.locale = (user as { locale?: string }).locale ?? "es"
      }

      if (trigger === "update" && session?.locale) {
        token.locale = session.locale
      }

      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub as string
      session.user.locale = token.locale ?? "es"
      return session
    },
  },
})
