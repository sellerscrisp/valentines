import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/ui/nav-bar";

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-10">
        <NavBar />
      </div>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
} 