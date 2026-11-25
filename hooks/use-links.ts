"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { LinkItem } from "@/types/link";

type LinkInput = {
  title: string;
  url: string;
  description?: string;
  icon?: string;
};

type LinkUpdate = Partial<LinkInput>;

export type LinkDraft = LinkItem & {
  isNew: boolean;
};

const supabase = createClient();

export function useLinks() {
  const { user, isLoading: authLoading } = useAuth();

  // Current working copy
  const [links, setLinks] = useState<LinkDraft[]>([]);

  // Last successfully saved copy
  const [savedLinks, setSavedLinks] = useState<LinkDraft[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check whether the working copy differs from the saved copy
  const hasChanges = useMemo(() => {
    const normalize = (items: LinkDraft[]) =>
      items.map(
        ({
          id,
          title,
          url,
          description,
          icon,
          position,
          is_active,
          isNew,
        }) => ({
          id,
          title,
          url,
          description,
          icon,
          position,
          is_active,
          isNew,
        }),
      );

    return (
      JSON.stringify(normalize(links)) !== JSON.stringify(normalize(savedLinks))
    );
  }, [links, savedLinks]);

  // Fetch links from Supabase
  const fetchLinks = useCallback(async () => {
    if (!user) {
      setLinks([]);
      setSavedLinks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", user.id)
      .order("position", { ascending: true });

    if (error) {
      console.error("Failed to fetch links:", error.message);
      setError("Unable to load your links.");
      setIsLoading(false);
      return;
    }

    const fetchedLinks: LinkDraft[] = (data as LinkItem[]).map((link) => ({
      ...link,
      isNew: false,
    }));

    setLinks(fetchedLinks);
    setSavedLinks(fetchedLinks);
    setIsLoading(false);
  }, [user]);

  // Initial fetch after authentication
  useEffect(() => {
    if (!authLoading) {
      fetchLinks();
    }
  }, [authLoading, fetchLinks]);

  // Add link locally
  const addLink = async (link: LinkInput): Promise<boolean> => {
    if (!user) {
      setError("You must be logged in to add a link.");
      return false;
    }

    if (!link.title.trim() || !link.url.trim()) {
      setError("Title and URL are required.");
      return false;
    }

    const newLink: LinkDraft = {
      id: crypto.randomUUID(),
      user_id: user.id,
      title: link.title.trim(),
      url: link.url.trim(),
      description: link.description?.trim() ?? "",
      icon: link.icon ?? "link",
      position: links.length,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isNew: true,
    };

    setLinks((prev) => [...prev, newLink]);
    setError(null);

    return true;
  };

  // Edit link locally
  const updateLink = async (
    linkId: string,
    updates: LinkUpdate,
  ): Promise<boolean> => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === linkId
          ? {
              ...link,
              ...(updates.title !== undefined && {
                title: updates.title.trim(),
              }),
              ...(updates.url !== undefined && {
                url: updates.url.trim(),
              }),
              ...(updates.description !== undefined && {
                description: updates.description.trim(),
              }),
              ...(updates.icon !== undefined && {
                icon: updates.icon,
              }),
              updated_at: new Date().toISOString(),
            }
          : link,
      ),
    );

    setError(null);
    return true;
  };

  // Delete link locally
  const deleteLink = async (linkId: string): Promise<boolean> => {
    setLinks((prev) =>
      prev
        .filter((link) => link.id !== linkId)
        .map((link, index) => ({
          ...link,
          position: index,
        })),
    );

    setError(null);
    return true;
  };

  // Toggle active status locally
  const toggleLink = async (linkId: string): Promise<boolean> => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === linkId
          ? {
              ...link,
              is_active: !link.is_active,
              updated_at: new Date().toISOString(),
            }
          : link,
      ),
    );

    setError(null);
    return true;
  };

  // Reorder links locally
  const reorderLinks = async (orderedLinks: LinkDraft[]): Promise<boolean> => {
    setLinks(
      orderedLinks.map((link, index) => ({
        ...link,
        position: index,
      })),
    );

    setError(null);
    return true;
  };

  // Save the entire working copy in one RPC call
  const saveChanges = async (): Promise<boolean> => {
    if (!user) {
      setError("You must be logged in to save your links.");
      return false;
    }

    if (!hasChanges) {
      return true;
    }

    setIsSaving(true);
    setError(null);

    const payload = links.map((link) => ({
      id: link.isNew ? null : link.id,
      title: link.title.trim(),
      url: link.url.trim(),
      description: link.description ?? "",
      icon: link.icon ?? "link",
      is_active: link.is_active,
    }));

    const { error: saveError } = await supabase.rpc("save_links", {
      p_links: payload,
    });

    if (saveError) {
      console.error("Failed to save links:", saveError.message);
      setError("Unable to save your changes. Please try again.");
      setIsSaving(false);
      return false;
    }

    // Reload persisted records to obtain real database IDs
    const { data, error: fetchError } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", user.id)
      .order("position", { ascending: true });

    if (fetchError) {
      console.error("Changes saved, but refresh failed:", fetchError.message);

      setError(
        "Your changes were saved, but we couldn't refresh the list. Please reload the page.",
      );

      setIsSaving(false);
      return false;
    }

    const refreshedLinks: LinkDraft[] = (data as LinkItem[]).map((link) => ({
      ...link,
      isNew: false,
    }));

    setLinks(refreshedLinks);
    setSavedLinks(refreshedLinks);

    setIsSaving(false);
    setError(null);

    return true;
  };

  // Discard all unsaved changes
  const discardChanges = () => {
    setLinks(savedLinks);
    setError(null);
  };

  return {
    links,
    isLoading,
    isSaving,
    error,
    hasChanges,

    fetchLinks,
    addLink,
    updateLink,
    deleteLink,
    toggleLink,
    reorderLinks,
    saveChanges,
    discardChanges,
  };
}
