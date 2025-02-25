import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import EntryCard from "@/app/scrapbook/components/EntryCard";
import { ProfileHeader } from "./components/ProfileHeader";
import { EditProfileButton } from "./components/EditProfileButton";
import { supabaseAdmin } from "@/lib/supabaseClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  if (!supabaseAdmin) {
    throw new Error('supabaseAdmin is not available');
  }

  console.log('Session user:', session.user);

  // Use supabaseAdmin instead of supabase
  const { data: existingUser, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle(); // Use maybeSingle() instead of single()

  if (fetchError) {
    console.error('Error fetching user:', fetchError);
    return <div>Error loading user data</div>;
  }

  // If user doesn't exist, create them
  const userData = existingUser || await createNewUser(session.user);
  if (!userData) {
    return <div>Error creating user</div>;
  }

  const { data: entries, error: entriesError } = await supabaseAdmin
    .from('scrapbook_entries')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (entriesError) {
    console.error('Error fetching entries:', entriesError);
    return <div>Error loading entries</div>;
  }

  return (
    <div className="container max-w-4xl py-8">
      <ProfileHeader 
        user={{ ...session.user, ...userData }}
        isOwnProfile={true}
      />
      
      <EditProfileButton />

      <div className="space-y-8 mt-8">
        <h2 className="text-xl font-semibold">My Entries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries?.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}

async function createNewUser(user: any) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available');
  }

  const { data: newUser, error: createError } = await supabaseAdmin
    .from('users')
    .insert({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.image
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating user:', createError);
    return null;
  }

  return newUser;
} 