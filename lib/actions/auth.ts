
"use server";

import { createClient } from "@/lib/supabase/server";

export type SignupState = {
  error?: string;
  success?: boolean;
};

export async function signup(
  formData: FormData
): Promise<SignupState> {
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !username || !email || !password) {
    return { error: "Please fill in all required fields." };
  }

  if (!/^[a-z0-9-]{3,20}$/.test(username)) {
    return {
      error: "Username must be 3–20 characters and contain only letters, numbers, or hyphens.",
    };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters long.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        name,
        username,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
