import Link from "next/link";
import { ArrowRight, ArrowUpRight, Globe } from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

const socials = [
  { title: "Portfolio", icon: Globe },
  { title: "GitHub", icon: FaGithub },
  { title: "LinkedIn", icon: FaLinkedin },
  { title: "Instagram", icon: FaInstagram },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f6]";

/* A small decorative QR-style code. Deterministic, so server and client match. */
const QR_SIZE = 15;

function buildQr() {
  const grid: boolean[][] = Array.from({ length: QR_SIZE }, () =>
    Array<boolean>(QR_SIZE).fill(false),
  );

  const finders = [
    [0, 0],
    [QR_SIZE - 7, 0],
    [0, QR_SIZE - 7],
  ];

  const inFinderZone = (x: number, y: number) =>
    finders.some(
      ([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7,
    );

  let seed = 11;
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      if (!inFinderZone(x, y)) grid[y][x] = ((seed >>> 16) & 1) === 1;
    }
  }

  for (const [fx, fy] of finders) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const ring = x === 0 || x === 6 || y === 0 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[fy + y][fx + x] = ring || core;
      }
    }
  }

  return grid;
}

const qr = buildQr();

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#faf9f6] text-neutral-900 antialiased">
      {/* Navigation */}
      <header className="border-b border-neutral-200">
        <nav className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className={`text-xl font-semibold tracking-tight ${focusRing}`}
          >
            parichaya<span className="text-neutral-400">.</span>
          </Link>

          <Link
            href="/auth"
            className={`group inline-flex h-10 items-center gap-2 bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 ${focusRing}`}
          >
            Get started
            <ArrowUpRight
              size={15}
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-16 px-6 py-16 md:grid-cols-2 md:gap-12 md:py-24 lg:gap-24">
        {/* Hero Content */}
        <div className="max-w-xl">
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
            Dherai Links,
            <span className="mt-3 block leading-[1.25] text-neutral-400">
              एउटै परिचय।
            </span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-7 text-neutral-500">
            Your portfolio, projects, socials and everything you create, all
            brought together in one personal page. One place for people to
            discover you.
          </p>

          <div className="mt-10">
            <Link
              href="/dashboard"
              className={`group inline-flex h-12 items-center gap-3 bg-neutral-900 px-7 text-sm font-medium text-white transition-colors hover:bg-neutral-700 ${focusRing}`}
            >
              Create your page
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>

          <p className="mt-14 max-w-sm border-t border-neutral-200 pt-6 text-xs leading-6 text-neutral-400">
            Made for developers, creators, freelancers and everyone with
            something to share.
          </p>
        </div>

        {/* Digital Card */}
        <div className="mx-auto w-full max-w-[440px] md:mr-0 md:ml-auto">
          <div className="relative">
            {/* Card stacked behind */}
            <div
              aria-hidden="true"
              className="absolute inset-x-6 -bottom-3 top-3 bg-[#e9e5dc]"
            />

            {/* Card front */}
            <div className="relative flex aspect-[1.7/1] flex-col justify-between bg-neutral-900 p-7 text-white sm:p-8">
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center bg-[#e8e4dc] text-xl font-semibold text-neutral-900">
                  A
                </div>

                <svg
                  viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
                  className="h-[72px] w-[72px] bg-white p-1.5"
                  shapeRendering="crispEdges"
                  role="img"
                  aria-label="QR code to your page"
                >
                  {qr.map((row, y) =>
                    row.map((filled, x) =>
                      filled ? (
                        <rect
                          key={`${x}-${y}`}
                          x={x}
                          y={y}
                          width="1"
                          height="1"
                          fill="#171717"
                        />
                      ) : null,
                    ),
                  )}
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Your Name
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Developer, creator & curious human.
                </p>

                <p className="mt-5 border-t border-neutral-700 pt-4 text-xs font-medium text-neutral-400">
                  parichaya.com/yourname
                </p>
              </div>
            </div>
          </div>

          {/* Socials */}
          <ul className="mt-10 grid grid-cols-4 gap-3">
            {socials.map((social) => {
              const Icon = social.icon;

              return (
                <li
                  key={social.title}
                  aria-label={social.title}
                  title={social.title}
                  className="flex h-12 items-center justify-center border border-neutral-200 bg-white text-neutral-700 transition-colors hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
                >
                  <Icon size={17} />
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex h-20 w-full max-w-6xl flex-col items-center justify-center gap-3 px-6 sm:flex-row sm:justify-between sm:gap-4">
          <Link
            href="/"
            className={`text-base font-semibold tracking-tight ${focusRing}`}
          >
            parichaya<span className="text-neutral-400">.</span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-neutral-400">
            <a
              href="https://github.com/tosheyy/parichaya"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 transition-colors hover:text-neutral-900 ${focusRing}`}
            >
              <FaGithub size={14} />
              GitHub
              <ArrowUpRight size={12} />
            </a>

            <span>Made for the curious internet.</span>

            <span>© 2026 parichaya.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
