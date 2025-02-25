"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "next-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ProfileHeaderProps {
  user: User & { id: string };  // Include the database ID
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (user.id) {
      // Get avatar from users table using ID
      supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
        });
    }
  }, [user.id]);

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>
          {user.name?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        {isOwnProfile && <p className="text-muted-foreground">{user.email}</p>}
      </div>
    </div>
  );
} 