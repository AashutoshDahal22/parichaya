import { ArrowUpRight, UserRound } from "lucide-react";
import {
  FaGlobe,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaYoutube,
} from "react-icons/fa";

type PublicProfileProps = {
  profile: {
    username: string;
    name: string;
    bio: string | null;
    avatar_url: string | null;
  };
};

const links = [
  {
    title: "My Portfolio",
    description: "Projects, experiments & things I've built",
    href: "#",
    icon: FaGlobe,
  },
  {
    title: "GitHub",
    description: "Open-source projects & code",
    href: "#",
    icon: FaGithub,
  },
  {
    title: "LinkedIn",
    description: "Let's connect professionally",
    href: "#",
    icon: FaLinkedin,
  },
  {
    title: "Instagram",
    description: "Life outside the terminal",
    href: "#",
    icon: FaInstagram,
  },
  {
    title: "X (Formerly Twitter)",
    description: "Life outside the terminal",
    href: "#",
    icon: FaTwitter,
  },
  {
    title: "Facebook",
    description: "Life outside the terminal",
    href: "#",
    icon: FaFacebook,
  },
  {
    title: "YouTube",
    description: "Videos & content",
    href: "#",
    icon: FaYoutube,
  },
];

export function PublicProfile({ profile }: PublicProfileProps) {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto flex max-w-md flex-col items-center">
        {/* Profile */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#e8e4dc] text-2xl font-semibold">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.name || profile.username}'s profile picture`}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound size={32} className="text-neutral-500" />
            )}
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            {profile.name || profile.username}
          </h1>

          {profile.bio && (
            <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-500">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="mt-10 flex w-full flex-col gap-3">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-400 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Icon size={20} className="text-neutral-700" />
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-extrabold text-black">
                    {link.title}
                  </h2>

                  <p className="mt-1 text-xs text-neutral-500">
                    {link.description}
                  </p>
                </div>

                <ArrowUpRight
                  size={18}
                  className="text-neutral-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-neutral-400">Made with intention.</p>
        </footer>
      </div>
    </main>
  );
}
