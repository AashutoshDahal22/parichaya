"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

export type Profile = {
  name: string;
  username: string | null;
  bio: string;
  avatar_url: string | null;
};

export function useProfile() {
  const { user, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch the authenticated user's profile
  useEffect(() => {
    if (authLoading) return;

    const userId = user?.id;

    if (!userId) {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchProfile() {
      const supabase = createClient();

      setProfileLoading(true);
      setProfileError(null);
      setProfile(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("name, username, bio, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error("Failed to fetch profile:", error.message);
        setProfileError("Unable to load your profile. Please try again.");
      } else if (!data) {
        setProfileError("Your profile could not be found.");
      } else {
        setProfile({
          name: data.name ?? "",
          username: data.username,
          bio: data.bio ?? "",
          avatar_url: data.avatar_url,
        });
      }

      setProfileLoading(false);
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id, authLoading]);

  // Claim a username
  const claimUsername = async (username: string): Promise<boolean> => {
    const normalizedUsername = username.trim().toLowerCase();
    const usernameRegex = /^[a-z0-9-]{3,20}$/;

    setClaimError(null);

    if (!normalizedUsername) {
      setClaimError("Please enter a username.");
      return false;
    }

    if (!usernameRegex.test(normalizedUsername)) {
      setClaimError(
        "Username must be 3–20 characters and contain only lowercase letters, numbers, and hyphens.",
      );
      return false;
    }

    const userId = user?.id;

    if (!userId) {
      setClaimError("You must be logged in to claim a username.");
      return false;
    }

    if (profile?.username) {
      setClaimError("You have already claimed a username.");
      return false;
    }

    setIsClaiming(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("profiles")
        .update({ username: normalizedUsername })
        .eq("id", userId)
        .is("username", null)
        .select("username")
        .single();

      if (error) {
        if (error.code === "23505") {
          setClaimError("This username is already taken. Try another one.");
        } else if (error.code === "PGRST116") {
          setClaimError(
            "Your username may already be claimed. Please refresh.",
          );
        } else {
          console.error("Failed to claim username:", error.message);
          setClaimError("Unable to claim your username. Please try again.");
        }

        return false;
      }

      setProfile((current) =>
        current ? { ...current, username: data.username } : current,
      );

      return true;
    } catch (error) {
      console.error("Unexpected username claim error:", error);
      setClaimError("Something went wrong. Please try again.");
      return false;
    } finally {
      setIsClaiming(false);
    }
  };

  // Save editable profile information
  const saveProfile = async (name: string, bio: string): Promise<boolean> => {
    const userId = user?.id;

    setSaveError(null);

    if (!userId) {
      setSaveError("You must be logged in to update your profile.");
      return false;
    }

    if (!name.trim()) {
      setSaveError("Please enter your display name.");
      return false;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("profiles")
        .update({
          name: name.trim(),
          bio: bio.trim(),
        })
        .eq("id", userId)
        .select("name, username, bio, avatar_url")
        .single();

      if (error) {
        console.error("Failed to update profile:", error.message);
        setSaveError("Unable to save your changes. Please try again.");
        return false;
      }

      setProfile({
        name: data.name ?? "",
        username: data.username,
        bio: data.bio ?? "",
        avatar_url: data.avatar_url,
      });

      return true;
    } catch (error) {
      console.error("Unexpected profile update error:", error);
      setSaveError("Something went wrong. Please try again.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    profileLoading,
    profileError,
    isClaiming,
    claimError,
    claimUsername,
    isSaving,
    saveError,
    saveProfile,
  };
}
