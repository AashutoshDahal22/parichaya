"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Check, Link2, UserRound, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Toast } from "@/components/ui/toast";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();

  const {
    profile,
    profileLoading,
    profileError,
    isSaving,
    saveError,
    saveProfile,
  } = useProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);

  // Populate editable fields when the profile is fetched
  useEffect(() => {
    if (!profile) return;

    setName(profile.name);
    setBio(profile.bio);
  }, [profile]);

  // Create a temporary preview URL for a selected image
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedImage]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageError(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    const success = await saveProfile(name, bio);

    if (success) {
      setToast({
        message: "Your profile has been updated successfully.",
        type: "success",
      });
    } else {
      setToast({
        message: saveError || "Unable to save your profile.",
        type: "error",
      });
    }
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteHost = siteUrl ? new URL(siteUrl).host : "";

  const accountEmail = user?.email ?? "";

  const profileImage = imagePreview || profile?.avatar_url || null;
  const username = profile?.username;

  if (authLoading || profileLoading) {
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

  if (profileError || !profile) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white p-8">
        <p className="text-sm text-red-600">
          {profileError || "Your profile could not be found."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
                >
                  <Camera size={16} />
                  Upload picture
                </button>

                {selectedImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                  >
                    <X size={16} />
                    Remove selection
                  </button>
                )}
              </div>

              <p className="mt-3 text-xs text-neutral-400">
                JPG, PNG or WebP. Maximum 5 MB.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              {selectedImage && (
                <p className="mt-2 text-xs text-neutral-500">
                  Selected: {selectedImage.name}
                </p>
              )}

              {imageError && (
                <p className="mt-2 text-xs text-red-600">{imageError}</p>
              )}

              <p className="mt-2 text-xs text-neutral-400">
                Image uploading will be connected to Supabase Storage next.
              </p>
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
            {/* Account email */}
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

            {/* Display name */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Display name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaveSuccess(false);
                }}
                placeholder="Enter your name"
                maxLength={50}
                className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900"
              />

              <p className="mt-2 text-xs text-neutral-400">
                This is the name people will see on your page.
              </p>
            </div>

            {/* Username - read only */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium"
              >
                Username
              </label>

              <div className="flex overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                <span className="flex items-center border-r border-neutral-200 bg-neutral-100 px-3 text-sm text-neutral-500">
                  {siteHost}/
                </span>

                <input
                  id="username"
                  type="text"
                  value={username ?? "Not claimed yet"}
                  readOnly
                  className="min-w-0 flex-1 cursor-not-allowed bg-neutral-50 px-3 py-3 text-sm text-neutral-500 outline-none"
                />
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
                <Link2 size={13} />
                Your unique public page address. Usernames cannot be changed
                here.
              </p>
            </div>

            {/* Biography */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="bio" className="text-sm font-medium">
                  Short bio
                </label>

                <span className="text-xs text-neutral-400">
                  {bio.length}/160
                </span>
              </div>

              <textarea
                id="bio"
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  setSaveSuccess(false);
                }}
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
              {name || "Your Name"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
              {bio || "Your bio will appear here."}
            </p>

            <p className="mt-5 text-xs text-neutral-400">
              {siteHost}/{username || "username"}
            </p>
          </div>
        </section>

        {/* Save actions */}
        <div className="border-t border-neutral-200 pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check size={16} />
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
