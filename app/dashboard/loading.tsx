export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[9999] grid place-items-center bg-black transition-opacity delay-150 duration-500 starting:opacity-0"
    >
      <div
        aria-hidden="true"
        className="relative grid size-18 place-items-center"
      >
        {/* expanding ripple */}
        <span className="absolute inset-[26px] rounded-full border border-indigo-400/60 animate-[ping_1.4s_cubic-bezier(0,0,0.2,1)_infinite] motion-reduce:hidden" />

        {/* slow counter-rotating dashed ring */}
        <span className="absolute inset-3.5 rounded-full border border-dashed border-white/25 animate-[spin_7s_linear_infinite_reverse] motion-reduce:hidden" />

        {/* comet: gradient ring fading into a tail, with a glowing head */}
        <span className="absolute inset-0 animate-[spin_1.4s_cubic-bezier(0.65,0.1,0.35,0.9)_infinite] motion-reduce:[animation-duration:3.5s]">
          <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,#818cf8_55%,#67e8f9_100%)] [mask-image:radial-gradient(farthest-side,transparent_calc(100%_-_2px),#000_calc(100%_-_2px))]" />
          <span className="absolute -top-0.5 left-1/2 -ml-0.75 size-1.5 rounded-full bg-cyan-300 shadow-[0_0_14px_3px_#67e8f9]" />
        </span>

        {/* core */}
        <span className="size-2 rounded-full bg-white animate-[pulse_1.4s_ease-in-out_infinite] motion-reduce:animate-none" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
