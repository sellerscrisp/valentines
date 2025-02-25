"use client";

import { LoginForm } from "@/components/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <span className="text-primary text-2xl">❤️</span>
          abby.crisp.sh
          <span className="text-primary text-2xl">❤️</span>
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
