import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // LOGIN
    if (body.action === "login") {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required." },
          { status: 400 },
        );
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      return NextResponse.json({
        message: "Login successful.",
        user: data.user,
      });
    }

    // SIGNUP
    if (body.action === "signup") {
      const { name, email, password } = body;

      if (!name || !email || !password) {
        return NextResponse.json(
          { error: "All fields are required." },
          { status: 400 },
        );
      }

      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters long." },
          { status: 400 },
        );
      }

      // const normalizedUsername = username
      //   .toLowerCase()
      //   .replace(/[^a-z0-9-]/g, "");

      // if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
      //   return NextResponse.json(
      //     { error: "Username must be between 3 and 20 characters." },
      //     { status: 400 },
      //   );
      // }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${new URL(request.url).origin}/api/auth/callback`,
          data: {
            name,
            // username: normalizedUsername,
          },
        },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        message: data.session
          ? "Account created successfully."
          : "Account created. Please check your email to verify your account.",
        user: data.user,
        requiresEmailConfirmation: !data.session,
      });
    }

    return NextResponse.json(
      { error: "Invalid authentication action." },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while processing your request." },
      { status: 500 },
    );
  }
}

// LOGOUT
export async function DELETE() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Logged out successfully.",
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while logging out." },
      { status: 500 },
    );
  }
}
