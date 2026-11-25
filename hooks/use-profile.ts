"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

export type Profile = {
  name: string;
  username: string | null;
  bio: string;
  avatar_url: string | null;
  background_url: string | null;
};

export type ImageChanges = {
  avatarFile?: File | null;
  backgroundFile?: File | null;
  removeAvatar?: boolean;
  removeBackground?: boolean;
};

const BUCKET_NAME = "profile-media";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Please upload a JPG, PNG, or WebP image.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Images must be smaller than 5 MB.";
  }

  return null;
}

function getStoragePath(url: string | null): string | null {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) return null;

  const path = url.substring(markerIndex + marker.length);

  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

export function useProfile() {
  const { user, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch authenticated user's profile
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
        .select("name, username, bio, avatar_url, background_url")
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
          background_url: data.background_url,
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

  // Upload a single image
  const uploadImage = async (
    file: File,
    userId: string,
    folder: "avatar" | "background",
  ): Promise<string> => {
    const supabase = createClient();

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = `${userId}/${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error(`Failed to upload ${folder}:`, error.message);
      throw new Error(
        folder === "avatar"
          ? "Unable to upload your profile picture."
          : "Unable to upload your background image.",
      );
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Save editable profile and images
  const saveProfile = async (
    name: string,
    bio: string,
    imageChanges: ImageChanges = {},
  ): Promise<boolean> => {
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

    const {
      avatarFile,
      backgroundFile,
      removeAvatar = false,
      removeBackground = false,
    } = imageChanges;

    // Validate before starting uploads
    if (avatarFile) {
      const error = validateImage(avatarFile);

      if (error) {
        setSaveError(`Profile picture: ${error}`);
        return false;
      }
    }

    if (backgroundFile) {
      const error = validateImage(backgroundFile);

      if (error) {
        setSaveError(`Background image: ${error}`);
        return false;
      }
    }

    setIsSaving(true);

    const supabase = createClient();
    const uploadedPaths: string[] = [];

    try {
      let avatarUrl = profile?.avatar_url ?? null;
      let backgroundUrl = profile?.background_url ?? null;

      // Upload new avatar
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile, userId, "avatar");

        const path = getStoragePath(avatarUrl);
        if (path) uploadedPaths.push(path);
      } else if (removeAvatar) {
        avatarUrl = null;
      }

      // Upload new background
      if (backgroundFile) {
        backgroundUrl = await uploadImage(backgroundFile, userId, "background");

        const path = getStoragePath(backgroundUrl);
        if (path) uploadedPaths.push(path);
      } else if (removeBackground) {
        backgroundUrl = null;
      }

      // Save profile information and image URLs
      const { data, error } = await supabase
        .from("profiles")
        .update({
          name: name.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl,
          background_url: backgroundUrl,
        })
        .eq("id", userId)
        .select("name, username, bio, avatar_url, background_url")
        .single();

      if (error) {
        console.error("Failed to update profile:", error.message);
        throw new Error("Unable to save your changes. Please try again.");
      }

      // Update local profile state
      setProfile({
        name: data.name ?? "",
        username: data.username,
        bio: data.bio ?? "",
        avatar_url: data.avatar_url,
        background_url: data.background_url,
      });

      // Remove replaced/removed images after database update succeeds
      const oldPaths: string[] = [];

      if (avatarFile || removeAvatar) {
        const oldPath = getStoragePath(profile?.avatar_url ?? null);
        if (oldPath) oldPaths.push(oldPath);
      }

      if (backgroundFile || removeBackground) {
        const oldPath = getStoragePath(profile?.background_url ?? null);
        if (oldPath) oldPaths.push(oldPath);
      }

      if (oldPaths.length > 0) {
        const pathsToRemove = oldPaths.filter(
          (path) => !uploadedPaths.includes(path),
        );

        if (pathsToRemove.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove(pathsToRemove);

          if (deleteError) {
            console.error(
              "Failed to remove old profile images:",
              deleteError.message,
            );
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Unexpected profile save error:", error);

      // Clean up newly uploaded files if the profile save failed
      if (uploadedPaths.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(uploadedPaths);
      }

      setSaveError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );

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
