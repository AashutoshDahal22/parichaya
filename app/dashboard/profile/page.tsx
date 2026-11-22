"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Check, ExternalLink, Link2, UserRound, X } from "lucide-react";

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name: "Your Name",
    username: "yourname",
    bio: "Your bio",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const updateProfile = (field: keyof typeof profile, value: string) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const username = profile.username.toLowerCase().replace(/[^a-z0-9-]/g, "");

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
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile preview"
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

                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
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

            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium"
              >
                Username
              </label>

              <div className="flex overflow-hidden rounded-lg border border-neutral-200 transition focus-within:border-neutral-900">
                <span className="flex items-center border-r border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500">
                  parichaya.com/
                </span>
                <input
                  id="username"
                  type="text"
                  value={profile.username}
                  onChange={(e) =>
                    updateProfile(
                      "username",
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
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
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Your public page</h2>
              <p className="mt-1 text-sm text-neutral-500">
                A quick preview of your profile information.
              </p>
            </div>
            <ExternalLink size={18} className="text-neutral-400" />
          </div>

          <div className="rounded-xl border border-neutral-200 bg-[#faf9f6] px-5 py-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-neutral-200">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile preview"
                  width={80}
                  height={80}
                  unoptimized
                  className="h-full w-full object-cover"
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
              parichaya.com/{username || "yourname"}
            </p>
          </div>
        </section>

        {/* Save actions */}
        <div className="flex flex-col-reverse justify-end gap-3 border-t border-neutral-200 pt-5 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              setProfile({
                name: "Your Name",
                username: "yourname",
                bio: "Developer, creator & curious human.",
              })
            }
            className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() =>
              alert("Profile changes are currently a preview only.")
            }
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
