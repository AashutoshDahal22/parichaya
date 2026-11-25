import type { ElementType } from "react";
import { ArrowUpRight, Link as LinkIcon, UserRound } from "lucide-react";

import {
  FaFacebook,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

type PublicProfileProps = {
  profile: {
    username: string;
    name: string;
    bio: string | null;
    avatar_url: string | null;
    background_url?: string | null;
  };
  links: {
    id: string;
    title: string;
    url: string;
    description: string | null;
    icon: string;
    position: number;
  }[];
};

// Keys are lowercase versions of the service names used in the links editor
const iconMap: Record<string, ElementType> = {
  website: FaGlobe,
  globe: FaGlobe,
  github: FaGithub,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  twitter: FaXTwitter,
  x: FaXTwitter,
  facebook: FaFacebook,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  "custom link": LinkIcon,
  link: LinkIcon,
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50";

function getHost(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function PublicProfile({ profile, links }: PublicProfileProps) {
  const displayName = profile.name || profile.username;
  const sortedLinks = [...links].sort((a, b) => a.position - b.position);

  return (
    <main className="min-h-screen bg-neutral-50 pb-16">
      {/* Cover */}
      <div className="relative h-40 w-full overflow-hidden bg-neutral-200 sm:h-56">
        {profile.background_url && (
          <img
            src={profile.background_url}
            alt=""
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      <div className="mx-auto max-w-xl px-5 sm:px-6">
        {/* Profile */}
        <header>
          <div className="relative -mt-12 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-neutral-200 ring-4 ring-neutral-50 sm:-mt-14 sm:h-28 sm:w-28">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${displayName}'s profile picture`}
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound size={40} className="text-neutral-400" />
            )}
          </div>

          <h1 className="mt-4 break-words text-2xl font-semibold tracking-tight text-neutral-900">
            {displayName}
          </h1>

          <p className="mt-0.5 text-sm text-neutral-500">@{profile.username}</p>

          {profile.bio && (
            <p className="mt-4 max-w-prose whitespace-pre-line break-words text-sm leading-6 text-neutral-700">
              {profile.bio}
            </p>
          )}
        </header>

        {/* Links */}
        <section aria-label="Links" className="mt-10">
          {sortedLinks.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {sortedLinks.map((link) => {
                const Icon = iconMap[link.icon?.toLowerCase()] ?? LinkIcon;
                const host = getHost(link.url);

                return (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${focusRing}`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 transition group-hover:bg-neutral-900 group-hover:text-white">
                        <Icon size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-base font-semibold text-neutral-900">
                          {link.title}
                        </h2>

                        {(link.description || host) && (
                          <p className="mt-0.5 truncate text-sm text-neutral-500">
                            {link.description || host}
                          </p>
                        )}
                      </div>

                      <ArrowUpRight
                        size={18}
                        className="shrink-0 text-neutral-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-300 px-5 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                <LinkIcon size={22} className="text-neutral-400" />
              </div>

              <h2 className="mt-4 text-sm font-semibold text-neutral-900">
                No links yet
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                {displayName} hasn't added any links. Check back soon.
              </p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-14 text-center">
          <p className="text-xs text-neutral-400">Made with intention.</p>
        </footer>
      </div>
    </main>
  );
}
