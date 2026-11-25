import { ArrowUpRight } from "lucide-react";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";

// Fonts approximating the reference: condensed serif, clean sans, mono
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pl-serif",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-pl-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-pl-mono",
});

type PublicProfileProps = {
  profile: {
    username: string;
    name: string;
    bio: string | null;
    avatar_url: string | null;
    background_url?: string | null;
    job_role?: string | null;
    location?: string | null;
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

type Subtext = {
  text: string;
  isHandle: boolean;
};

// TODO: remove these fallbacks once job role and location come from the database
const JOB_ROLE_PLACEHOLDER = "Job role";
const LOCATION_PLACEHOLDER = "Location";

// Platforms where the first path segment is the account name
const HANDLE_HOSTS = [
  "instagram.com",
  "tiktok.com",
  "github.com",
  "x.com",
  "twitter.com",
  "facebook.com",
];

// First path segments that are not account names
const RESERVED_SEGMENTS = new Set([
  "p",
  "reel",
  "reels",
  "explore",
  "share",
  "orgs",
  "profile.php",
  "people",
  "pages",
  "groups",
]);

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function cleanHandle(value?: string) {
  const handle = value?.replace(/^@/, "").trim();
  return handle ? handle : null;
}

function matchesHost(host: string, domain: string) {
  return host === domain || host.endsWith(`.${domain}`);
}

// Pulls the account name out of a profile URL, e.g.
// instagram.com/aashutosh -> @aashutosh. Falls back to the domain.
function getSubtext(url: string): Subtext | null {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^(www|m)\./, "");
  const segments = parsed.pathname.split("/").filter(Boolean).map(safeDecode);

  let handle: string | null = null;

  if (HANDLE_HOSTS.some((domain) => matchesHost(host, domain))) {
    const first = segments[0];

    if (first && !RESERVED_SEGMENTS.has(first.toLowerCase())) {
      handle = cleanHandle(first);
    }
  } else if (matchesHost(host, "linkedin.com")) {
    if (["in", "company", "school"].includes(segments[0]?.toLowerCase())) {
      handle = cleanHandle(segments[1]);
    }
  } else if (matchesHost(host, "youtube.com")) {
    if (segments[0]?.startsWith("@")) {
      handle = cleanHandle(segments[0]);
    } else if (["c", "user"].includes(segments[0]?.toLowerCase())) {
      handle = cleanHandle(segments[1]);
    }
  }

  if (handle) {
    return { text: `@${handle}`, isHandle: true };
  }

  return host ? { text: host, isHandle: false } : null;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "";

  const first = Array.from(parts[0])[0] ?? "";
  const last =
    parts.length > 1 ? (Array.from(parts[parts.length - 1])[0] ?? "") : "";

  return (first + last).toUpperCase();
}

// Soft folded-paper backdrop drawn with SVG, used when there is no background image
function SoftBackdrop() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1240 880"
      preserveAspectRatio="xMidYMid slice"
      className="fixed inset-0 -z-10 h-full w-full"
    >
      <defs>
        <linearGradient id="pl-shade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d7d4cf" />
          <stop offset="1" stopColor="#cdcac4" />
        </linearGradient>

        <linearGradient id="pl-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9d6d1" stopOpacity="0.9" />
          <stop offset="1" stopColor="#d9d6d1" stopOpacity="0" />
        </linearGradient>

        <filter
          id="pl-soft"
          filterUnits="userSpaceOnUse"
          x="-200"
          y="-200"
          width="1640"
          height="1280"
        >
          <feGaussianBlur stdDeviation="28" />
        </filter>

        <filter
          id="pl-edge"
          filterUnits="userSpaceOnUse"
          x="-50"
          y="-50"
          width="1340"
          height="980"
        >
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      <rect width="1240" height="880" fill="#e4e1dc" />
      <rect width="360" height="520" fill="url(#pl-left)" />

      {/* Bright ridge along the fold */}
      <path
        d="M180 0 C450 120 760 230 860 470 C930 640 1100 800 1240 860"
        fill="none"
        stroke="#f3f1ed"
        strokeWidth="170"
        filter="url(#pl-soft)"
        opacity="0.95"
      />

      {/* Shaded side of the fold */}
      <path
        d="M180 0 C450 120 760 230 860 470 C930 640 1100 800 1240 860 L1240 0 Z"
        fill="url(#pl-shade)"
        filter="url(#pl-edge)"
      />
    </svg>
  );
}

export function PublicProfile({ profile, links }: PublicProfileProps) {
  const displayName = profile.name || profile.username;
  const initials = getInitials(displayName);
  const sortedLinks = [...links].sort((a, b) => a.position - b.position);

  const jobRole = profile.job_role?.trim() || null;
  const location = profile.location?.trim() || null;

  const year = new Date().getFullYear();

  return (
    <main
      className={`${serif.variable} ${sans.variable} ${mono.variable} relative isolate flex min-h-screen items-center justify-center bg-[#e4e1dc] px-4 py-12 font-[family-name:var(--font-pl-sans)] text-neutral-950 antialiased sm:py-16`}
    >
      {/* Background */}
      {profile.background_url ? (
        <img
          src={profile.background_url}
          alt=""
          decoding="async"
          fetchPriority="high"
          className="fixed inset-0 -z-10 h-full w-full object-cover"
        />
      ) : (
        <SoftBackdrop />
      )}

      {/* Glass card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-white/60 bg-white/65 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.45),0_2px_6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-150">
        {/* Glare: soft corner light and a bright top edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_0%_0%,rgba(255,255,255,0.65),transparent_60%)]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
        />

        <div className="relative">
          {/* Profile */}
          <header className="flex flex-col items-center px-6 pb-8 pt-10 text-center sm:px-8">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-neutral-950 shadow-lg shadow-black/15 ring-4 ring-white/60">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`${displayName}'s profile picture`}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="font-[family-name:var(--font-pl-serif)] text-[22px] tracking-tight text-white"
                >
                  {initials}
                </span>
              )}
            </div>

            <h1 className="mt-6 break-words font-[family-name:var(--font-pl-serif)] text-[32px] leading-9 tracking-[-0.01em]">
              {displayName}
            </h1>

            <p className="mt-1.5 font-[family-name:var(--font-pl-mono)] text-xs text-black/50">
              @{profile.username}
            </p>

            {/* Job role and location */}
            <p className="mt-2 text-sm">
              <span className={jobRole ? "text-black/65" : "text-black/40"}>
                {jobRole ?? JOB_ROLE_PLACEHOLDER}
              </span>

              <span aria-hidden="true" className="mx-1.5 text-black/40">
                ·
              </span>

              <span className={location ? "text-black/65" : "text-black/40"}>
                {location ?? LOCATION_PLACEHOLDER}
              </span>
            </p>

            {profile.bio && (
              <p className="mt-4 max-w-sm whitespace-pre-line break-words text-sm leading-6 text-black/70">
                {profile.bio}
              </p>
            )}
          </header>

          {/* Links */}
          <nav aria-label="Links" className="border-t border-black/10">
            {sortedLinks.length > 0 ? (
              <ul className="divide-y divide-black/10">
                {sortedLinks.map((link, index) => {
                  const subtext: Subtext | null = link.description
                    ? { text: link.description, isHandle: false }
                    : getSubtext(link.url);

                  const subtextStyle = subtext?.isHandle
                    ? "font-semibold text-black/85"
                    : "text-black/60";

                  const isExternal = /^https?:\/\//i.test(link.url);

                  return (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        {...(isExternal
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="group flex min-h-16 items-center gap-4 px-6 py-2 transition-colors hover:bg-white/40 focus-visible:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-950 sm:px-8"
                      >
                        <span
                          aria-hidden="true"
                          className="font-[family-name:var(--font-pl-mono)] text-xs tabular-nums text-black/45"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-[17px] font-medium tracking-tight">
                            {link.title}
                          </span>

                          {subtext && (
                            <span
                              className={`mt-0.5 block truncate text-xs min-[420px]:hidden ${subtextStyle}`}
                            >
                              {subtext.text}
                            </span>
                          )}
                        </div>

                        {subtext && (
                          <span
                            className={`hidden max-w-[50%] truncate text-sm min-[420px]:block ${subtextStyle}`}
                          >
                            {subtext.text}
                          </span>
                        )}

                        <ArrowUpRight
                          size={13}
                          strokeWidth={1.75}
                          className="shrink-0 transition-transform group-hover:-translate-y-px group-hover:translate-x-px motion-reduce:transition-none"
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center sm:px-8">
                <p className="text-[17px] font-medium tracking-tight">
                  No links yet
                </p>

                <p className="mt-1.5 text-sm text-black/60">
                  {displayName} hasn't added any links. Check back soon.
                </p>
              </div>
            )}
          </nav>

          {/* Footer */}
          <footer className="border-t border-black/10 px-6 py-4 text-center">
            <p className="font-[family-name:var(--font-pl-mono)] text-xs text-black/50">
              © {year} {displayName}
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
