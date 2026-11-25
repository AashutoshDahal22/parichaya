import { createClient } from "@/lib/supabase/server";

export async function getPublicProfile(username: string) {
  const supabase = await createClient();

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, name, bio, avatar_url")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (profileError) {
    console.error("Failed to fetch public profile:", profileError.message);
    throw new Error("Failed to fetch public profile.");
  }

  if (!profile) {
    return null;
  }

  // Fetch enabled links belonging to this profile
  const { data: links, error: linksError } = await supabase
    .from("links")
    .select("id, title, url, description, icon, position")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("position", { ascending: true });

  if (linksError) {
    console.error("Failed to fetch public links:", linksError.message);
    throw new Error("Failed to fetch public links.");
  }

  return {
    profile: {
      username: profile.username,
      name: profile.name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
    },
    links: links ?? [],
  };
}
