import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia, Session, User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import prisma from "./lib/db";

// Create a Prisma adapter for Lucia authentication
const adapter = new PrismaAdapter(prisma.session, prisma.user);

// Initialize Lucia authentication
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  // Define which user attributes to return from the database
  getUserAttributes: (databaseUserAttributes) => {
    return {
      username: databaseUserAttributes.username,
      name: databaseUserAttributes.name,
      email: databaseUserAttributes.email,
      profileImageUrl: databaseUserAttributes.profileImageUrl,
      isEmailVerified: databaseUserAttributes.isEmailVerified,
    };
  },
});

// Type declaration for Lucia module
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

// Interface defining the structure of user attributes in the database
interface DatabaseUserAttributes {
  id: string;
  name: string | null;
  username: string;
  email: string;
  profileImageUrl: string | null;
  isEmailVerified: boolean;
}

// Function to validate user request and manage session
export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    // Get session ID from cookies
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    // Validate the session
    const result = await lucia.validateSession(sessionId);

    try {
      // If session is valid and fresh, set a new session cookie
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
      // If session is invalid, set a blank session cookie
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch {}
    return result;
  },
);
