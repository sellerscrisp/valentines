import { NextResponse } from "next/server";
import { authenticate } from "@/lib/authCheck";

/**
 * A higher-order function that wraps API route handlers with authentication.
 * @param handler - The API route handler function.
 * @returns A new handler that includes authentication logic.
 */
export function withAuth<T extends { [K: string]: string }>(
  handler: (
    req: Request,
    context: { params: T },
    session: any
  ) => Promise<NextResponse>
) {
  return async (req: Request, context: { params: T }) => {
    const session = await authenticate();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return handler(req, context, session);
  };
} 