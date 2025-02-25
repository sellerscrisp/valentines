"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "./EditProfileDialog";
import { Settings } from "lucide-react";

export function EditProfileButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="link" 
        size="sm"
        className="relative"
        onClick={() => setOpen(true)}
      >
        <Settings className="h-4 w-4 mr-2" />
        Edit Profile
      </Button>
      <EditProfileDialog open={open} onOpenChange={setOpen} />
    </>
  );
} 