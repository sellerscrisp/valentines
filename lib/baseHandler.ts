import { NextResponse } from "next/server";
import { authenticate } from "@/lib/authCheck";

/**
 * A higher-order function that wraps API route handlers with authentication.
 * @param handler - The API route handler function.
 * @returns A new handler that includes authentication logic.
 */
export const withAuth = <P extends Record<string, string>>(
  handler: (
    req: Request,
    context: { params: P },
    session: any
  ) => Promise<NextResponse>
) => {
  return async (
    req: Request,
    context: { params: P }
  ): Promise<NextResponse> => {
    const session = await authenticate(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, context, session);
  };
}; 