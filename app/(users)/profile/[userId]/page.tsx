import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ProfileHeader } from "../components/ProfileHeader";

export default async function UserProfilePage({ 
  params 
}: { 
  params: Promise<{ userId: string }> 
}) {
  const { userId } = await params;
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // If viewing own profile, show the main profile page
  if (session.user.id === userId) {
    redirect('/profile');
  }

  // Fetch user and their entries
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!user) {
    redirect('/404');
  }

  // const { data: entries } = await supabase
  //   .from('scrapbook_entries')
  //   .select('*, comments(*)')
  //   .eq('user_id', userId)
  //   .order('created_at', { ascending: false });

  return (
    <div className="container max-w-4xl py-8">
      <ProfileHeader 
        user={user} 
        isOwnProfile={false}
      />
    </div>
  );
} 