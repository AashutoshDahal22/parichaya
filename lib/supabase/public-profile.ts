import { createClient } from "@/lib/supabase/server";

export async function getPublicProfile(username: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("username, name, bio, avatar_url")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch public profile:", error.message);
    throw new Error("Failed to fetch public profile.");
  }

  return data;
}
