"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
} from "react";
import {
  ArrowUpRight,
  Camera,
  Check,
  CircleAlert,
  ImagePlus,
  Info,
  Link2,
  Lock,
  RotateCcw,
  UserRound,
  X,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Toast } from "@/components/ui/toast";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BIO_LIMIT = 160;

type ToastType = NonNullable<ComponentProps<typeof Toast>["type"]>;

type ToastState = {
  id: number;
  message: string;
  type: ToastType;
};

// Shared styles
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2";

const primaryButton = `inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

const secondaryButton = `inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

const overlayButton = `inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-sm backdrop-blur transition hover:bg-white ${focusRing}`;

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5";

const readOnlyClass =
  "w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-50 py-3 pl-4 pr-10 text-sm text-neutral-500 outline-none";

function getHost(url?: string) {
  if (!url) return "";

  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

function useImagePreview(file: File | null) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return preview;
}

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

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  // Last saved values, used to detect unsaved changes
  const [saved, setSaved] = useState({ name: "", bio: "" });

  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<File | null>(
    null,
  );

  // Saved images marked for deletion on the next save
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [removeBackground, setRemoveBackground] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);

  const avatarPreview = useImagePreview(selectedAvatar);
  const backgroundPreview = useImagePreview(selectedBackground);

  // Stable callbacks so the Toast's auto-dismiss timer isn't reset on every render
  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  // Populate editable fields when the profile is fetched
  useEffect(() => {
    if (!profile) return;

    const profileName = profile.name ?? "";
    const profileBio = profile.bio ?? "";

    setName(profileName);
    setBio(profileBio);
    setSaved({ name: profileName, bio: profileBio });
  }, [profile]);

  // Surface save errors from the useProfile hook as an error toast
  useEffect(() => {
    if (saveError) showToast(saveError, "error");
  }, [saveError, showToast]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteHost = getHost(siteUrl);
  const accountEmail = user?.email ?? "";
  const username = profile?.username;

  const publicUrl =
    siteUrl && username ? `${siteUrl.replace(/\/$/, "")}/${username}` : null;

  // New selection > saved image (unless marked for removal) > placeholder
  const profileImage =
    avatarPreview || (removeAvatar ? null : (profile?.avatar_url ?? null));

  const backgroundImage =
    backgroundPreview ||
    (removeBackground ? null : (profile?.background_url ?? null));

  const hasChanges = name !== saved.name || bio !== saved.bio;

  const hasImageSelection = Boolean(
    selectedAvatar || selectedBackground || removeAvatar || removeBackground,
  );

  const hasUnsavedChanges = hasChanges || hasImageSelection;

  // Validate and select images
  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
    type: "avatar" | "background",
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast("Please select a JPG, PNG, or WebP image.", "warning");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showToast("Image size must be less than 5 MB.", "warning");
      event.target.value = "";
      return;
    }

    if (type === "avatar") {
      setSelectedAvatar(file);
      setRemoveAvatar(false);
    } else {
      setSelectedBackground(file);
      setRemoveBackground(false);
    }

    // Allow selecting the same file again after removing it
    event.target.value = "";
  };

  const handleRemoveAvatar = () => {
    if (selectedAvatar) {
      // Drop the newly selected file and revert to the saved image
      setSelectedAvatar(null);
    } else if (profile?.avatar_url) {
      // Mark the saved image for deletion on save
      setRemoveAvatar(true);
    }

    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const handleRemoveBackground = () => {
    if (selectedBackground) {
      // Drop the newly selected file and revert to the saved image
      setSelectedBackground(null);
    } else if (profile?.background_url) {
      // Mark the saved image for deletion on save
      setRemoveBackground(true);
    }

    if (backgroundInputRef.current) {
      backgroundInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    closeToast();

    // The hook saves trimmed values, so keep local state in sync with them
    const trimmedName = name.trim();
    const trimmedBio = bio.trim();

    const success = await saveProfile(name, bio, {
      avatarFile: selectedAvatar,
      backgroundFile: selectedBackground,
      removeAvatar,
      removeBackground,
    });

    if (success) {
      setName(trimmedName);
      setBio(trimmedBio);
      setSaved({ name: trimmedName, bio: trimmedBio });

      setSelectedAvatar(null);
      setSelectedBackground(null);

      setRemoveAvatar(false);
      setRemoveBackground(false);

      showToast("Profile updated successfully.", "success");
    }
  };

  const handleDiscard = () => {
    if (!hasUnsavedChanges) return;

    const confirmed = window.confirm(
      "Are you sure you want to discard all unsaved changes?",
    );

    if (!confirmed) return;

    setName(saved.name);
    setBio(saved.bio);

    setSelectedAvatar(null);
    setSelectedBackground(null);

    setRemoveAvatar(false);
    setRemoveBackground(false);

    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }

    if (backgroundInputRef.current) {
      backgroundInputRef.current.value = "";
    }

    showToast("Unsaved changes discarded.", "info");
  };

  // Loading state
  if (authLoading || profileLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="animate-pulse">
          <div className="h-7 w-40 rounded bg-neutral-200" />
          <div className="mt-3 h-4 w-72 max-w-full rounded bg-neutral-100" />

          <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="h-44 bg-neutral-100" />
            <div className="px-6 pb-6">
              <div className="-mt-12 h-24 w-24 rounded-full bg-neutral-200 ring-4 ring-white" />
              <div className="mt-4 h-5 w-40 rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-28 rounded bg-neutral-100" />
            </div>
          </div>

          <div className="mt-6 h-80 rounded-2xl bg-neutral-100" />
        </div>
      </div>
    );
  }

  // Signed out state
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white px-8 py-14 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <UserRound size={22} className="text-neutral-400" />
        </div>

        <h1 className="mt-4 text-lg font-semibold">Unable to load profile</h1>

        <p className="mt-2 text-sm text-neutral-500">
          Please sign in again to view your profile.
        </p>
      </div>
    );
  }

  // Profile error state
  if (profileError || !profile) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white px-8 py-14 text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <CircleAlert size={22} className="text-red-600" />
        </div>

        <h1 className="mt-4 text-lg font-semibold">Profile not available</h1>

        <p className="mt-2 text-sm text-neutral-500">
          {profileError || "Your profile could not be found."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Toast notifications */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}

      {/* Page heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your Profile
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Manage how people see you on your public page.
          </p>
        </div>

        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex w-fit items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 ${focusRing}`}
          >
            View public page
            <ArrowUpRight size={15} className="text-neutral-400" />
          </a>
        )}
      </div>

      <div className="space-y-6">
        {/* Profile appearance */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="font-semibold">Profile appearance</h2>

            <p className="mt-1 text-sm text-neutral-500">
              This is a live preview of your page. Pick a picture and
              background, and your name and bio update as you type.
            </p>
          </div>

          {/* Live preview */}
          <div className="overflow-hidden rounded-xl border border-neutral-200">
            {/* Cover */}
            <div className="relative h-36 w-full bg-neutral-100 sm:h-44">
              {backgroundImage ? (
                <>
                  <img
                    src={backgroundImage}
                    alt="Background preview"
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  <div className="absolute right-3 top-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => backgroundInputRef.current?.click()}
                      className={overlayButton}
                    >
                      <ImagePlus size={14} />
                      Change
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveBackground}
                      className={overlayButton}
                      aria-label="Remove background image"
                    >
                      <X size={14} />
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => backgroundInputRef.current?.click()}
                  className="group absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-400 transition hover:bg-neutral-200/50 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-900"
                >
                  <ImagePlus size={26} />
                  <span className="text-sm font-medium">
                    Add a background image
                  </span>
                </button>
              )}
            </div>

            {/* Avatar and details */}
            <div className="px-5 pb-6 sm:px-6">
              <div className="relative -mt-12 h-24 w-24">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  aria-label={
                    profileImage
                      ? "Change profile picture"
                      : "Upload profile picture"
                  }
                  className="group flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-neutral-100 ring-4 ring-white focus-visible:outline-none focus-visible:ring-neutral-900"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile picture preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound size={38} className="text-neutral-400" />
                  )}

                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Camera size={20} />
                  </span>
                </button>

                {profileImage ? (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    aria-label={
                      selectedAvatar
                        ? "Remove selected profile picture"
                        : "Remove profile picture"
                    }
                    className={`absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50 ${focusRing}`}
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <span className="pointer-events-none absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white ring-2 ring-white">
                    <Camera size={13} />
                  </span>
                )}
              </div>

              <div className="mt-4">
                <p
                  className={`truncate text-lg font-semibold tracking-tight ${
                    name.trim() ? "text-neutral-900" : "text-neutral-300"
                  }`}
                >
                  {name.trim() || "Your name"}
                </p>

                <p className="mt-0.5 truncate text-sm text-neutral-500">
                  {username ? `@${username}` : "Username not claimed yet"}
                </p>

                <p
                  className={`mt-3 max-w-prose whitespace-pre-line break-words text-sm leading-6 ${
                    bio.trim() ? "text-neutral-700" : "text-neutral-300"
                  }`}
                >
                  {bio.trim() || "Your bio will appear here."}
                </p>
              </div>
            </div>
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleImageChange(e, "avatar")}
            className="hidden"
          />

          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleImageChange(e, "background")}
            className="hidden"
          />

          <p className="mt-3 text-xs text-neutral-400">
            Use a JPG, PNG, or WebP image up to 5 MB. A wide image works best
            for the background.
          </p>

          {/* Upload note */}
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <Info size={18} className="mt-0.5 shrink-0 text-neutral-500" />

            <p className="text-xs leading-5 text-neutral-500">
              Your profile picture and background image will appear on your
              public page once you save your changes.
            </p>
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Display name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Display name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={50}
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-neutral-400">
                  This is the name people will see on your page.
                </p>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>

                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={accountEmail}
                    readOnly
                    className={readOnlyClass}
                  />

                  <Lock
                    size={15}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                </div>

                <p className="mt-2 text-xs text-neutral-400">
                  The email address linked to your account.
                </p>
              </div>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium"
              >
                Username
              </label>

              <div className="flex overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                {siteHost && (
                  <span className="flex items-center border-r border-neutral-200 bg-neutral-100 px-3 text-sm text-neutral-500">
                    {siteHost}/
                  </span>
                )}

                <div className="relative min-w-0 flex-1">
                  <input
                    id="username"
                    type="text"
                    value={username ?? "Not claimed yet"}
                    readOnly
                    className="w-full cursor-not-allowed bg-neutral-50 py-3 pl-3 pr-10 text-sm text-neutral-500 outline-none"
                  />

                  <Lock
                    size={15}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                </div>
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
                <Link2 size={13} />
                Your unique public page address. Usernames cannot be changed
                here.
              </p>
            </div>

            {/* Bio */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="bio" className="text-sm font-medium">
                  Short bio
                </label>

                <span
                  className={`text-xs tabular-nums ${
                    bio.length >= BIO_LIMIT - 20
                      ? "font-medium text-amber-600"
                      : "text-neutral-400"
                  }`}
                >
                  {bio.length}/{BIO_LIMIT}
                </span>
              </div>

              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people a little about yourself..."
                maxLength={BIO_LIMIT}
                rows={4}
                className={`${inputClass} resize-none leading-6`}
              />

              <p className="mt-2 text-xs text-neutral-400">
                Keep it short and let people know what you do.
              </p>
            </div>
          </div>
        </section>

        {/* Save actions */}
        <div className="flex flex-col-reverse justify-between gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center">
          <div className="text-xs text-neutral-500" aria-live="polite">
            {hasUnsavedChanges
              ? "You have unsaved changes."
              : "All changes are saved."}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!hasUnsavedChanges || isSaving}
              className={secondaryButton}
            >
              <RotateCcw size={15} />
              Discard
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className={primaryButton}
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
