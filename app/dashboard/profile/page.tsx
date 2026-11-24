"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Check, Link2, UserRound, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type Profile = {
  name: string;
  username: string;
  bio: string;
};

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile data available from the authenticated Supabase user.
  const [profile, setProfile] = useState<Profile>({
    name: "",
    username: "",
    bio: "",
  });

  // Existing profile picture URL from user metadata.
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Selected image file, ready for a future upload API.
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Populate profile fields using the authenticated user's metadata.
  useEffect(() => {
    if (!user) return;

    const metadata = user.user_metadata ?? {};

    setProfile({
      name: metadata.name ?? "",
      username: metadata.username ?? "",
      bio: metadata.bio ?? "",
    });

    setProfileImage(metadata.avatar_url ?? metadata.picture ?? null);
  }, [user]);

  // Update an individual profile field.
  // This currently updates the form state only.
  const updateProfile = (field: keyof Profile, value: string) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // Handle image selection.
  // Later, connect this handler to the profile image upload API.
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate the selected file type.
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return;
    }

    // Validate the selected file size (maximum 5 MB).
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setSelectedImage(file);
  };

  // Handle profile picture removal.
  // Later, connect this to the image removal API.
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setProfileImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle profile updates.
  // Later, send profile information and selected image to the API.
  const handleSave = async () => {
    // TODO: Implement profile update API.
    // Send profile data and selectedImage to the backend.
  };

  // Public profile URL.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteHost = siteUrl ? new URL(siteUrl).host : "";

  const accountEmail = user?.email ?? "";

  const username = profile.username;

  // Display loading state while authentication initializes.
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-neutral-200" />
          <div className="h-40 rounded-2xl bg-neutral-200" />
          <div className="h-80 rounded-2xl bg-neutral-200" />
        </div>
      </div>
    );
  }

  // Display an error state when no authenticated user is available.
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold">Unable to load profile</h1>

        <p className="mt-2 text-sm text-neutral-500">
          Please sign in again to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Your Profile</h1>

        <p className="mt-2 text-sm text-neutral-500">
          Manage how people see you on your public page.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile picture */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="mb-5">
            <h2 className="font-semibold">Profile picture</h2>

            <p className="mt-1 text-sm text-neutral-500">
              Add a photo so people can recognize you.
            </p>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Display the existing profile image or fallback icon. */}
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile picture"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <UserRound size={36} className="text-neutral-400" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Open file picker to select a profile picture. */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
                >
                  <Camera size={16} />
                  Upload picture
                </button>

                {/* Remove currently selected or existing profile picture. */}
                {(profileImage || selectedImage) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                  >
                    <X size={16} />
                    Remove
                  </button>
                )}
              </div>

              <p className="mt-3 text-xs text-neutral-400">
                JPG, PNG or WebP. Maximum 5 MB.
              </p>

              {/* Hidden file input used by the upload button. */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Display the selected filename. */}
              {selectedImage && (
                <p className="mt-2 text-xs text-neutral-500">
                  Selected: {selectedImage.name}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Basic information */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="font-semibold">Basic information</h2>

            <p className="mt-1 text-sm text-neutral-500">
              Your name and a little introduction about yourself.
            </p>
          </div>

          <div className="space-y-5">
            {/* Account email from Supabase Auth */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={accountEmail}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 outline-none"
              />

              <p className="mt-2 text-xs text-neutral-400">
                Your email address associated with your account.
              </p>
            </div>

            {/* Editable display name */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Display name
              </label>

              <input
                id="name"
                type="text"
                value={profile.name}
                onChange={(e) => updateProfile("name", e.target.value)}
                placeholder="Enter your name"
                maxLength={50}
                className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900"
              />

              <p className="mt-2 text-xs text-neutral-400">
                This is the name people will see on your page.
              </p>
            </div>

            {/* Editable username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium"
              >
                Username
              </label>

              <div className="flex overflow-hidden rounded-lg border border-neutral-200 transition focus-within:border-neutral-900">
                <span className="flex items-center border-r border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500">
                  {siteHost}/
                </span>

                <input
                  id="username"
                  type="text"
                  value={profile.username}
                  onChange={(e) => updateProfile("username", e.target.value)}
                  maxLength={20}
                  placeholder="yourname"
                  className="min-w-0 flex-1 px-3 py-3 text-sm outline-none"
                />
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
                <Link2 size={13} />
                Your unique public page address.
              </p>
            </div>

            {/* Editable biography */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="bio" className="text-sm font-medium">
                  Short bio
                </label>

                <span className="text-xs text-neutral-400">
                  {profile.bio.length}/160
                </span>
              </div>

              <textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => updateProfile("bio", e.target.value)}
                placeholder="Tell people a little about yourself..."
                maxLength={160}
                rows={4}
                className="w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900"
              />

              <p className="mt-2 text-xs text-neutral-400">
                Keep it short and let people know what you do.
              </p>
            </div>
          </div>
        </section>

        {/* Public page preview */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="mb-5">
            <h2 className="font-semibold">Your public page</h2>

            <p className="mt-1 text-sm text-neutral-500">
              A quick preview of your profile information.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-[#faf9f6] px-5 py-8 text-center">
            {/* Public profile image */}
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-neutral-200">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile picture"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <UserRound size={32} className="text-neutral-400" />
              )}
            </div>

            <h3 className="mt-4 text-lg font-semibold">
              {profile.name || "Your Name"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
              {profile.bio || "Your bio will appear here."}
            </p>

            <p className="mt-5 text-xs text-neutral-400">
              {siteHost}/{username || "yourname"}
            </p>
          </div>
        </section>

        {/* Profile save actions */}
        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-5">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
          >
            <Check size={16} />
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
