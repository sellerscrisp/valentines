import { auth } from "@/lib/auth";
import getServerSession from "next-auth";
import { authOptions } from "@/lib/auth";

export async function authenticate() {
  const session = await auth();
  if (!session || !session.user || !session.user.email) {
    return null;
  }
  return session;
}

export async function authCheck() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  return session;
} 