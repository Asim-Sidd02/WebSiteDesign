import { Navbar, Footer } from "@/components";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 top-10 h-[28rem] w-[28rem] rounded-full bg-brand-500/10 blur-[120px]" />
        <section className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-5 pb-20 pt-28 sm:px-8">
          <p className="label">Error 404</p>
          <h1 className="display mt-5 max-w-3xl text-[2.85rem] sm:text-7xl">
            This page <span className="italic text-brand-500">isn’t here.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-ink/60 sm:text-lg sm:leading-8">
            The link may be old or mistyped. You can go back home, try the free avatar demo, or look up a word in the sign dictionary.
          </p>
          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <a href="/" className="rounded-xl bg-ink px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-brand-500 sm:rounded-lg sm:py-3.5">
              Back to home
            </a>
            <a href="/demo" className="rounded-xl border border-ink/15 bg-white/70 px-5 py-4 text-center text-sm font-semibold transition hover:border-ink/30 sm:rounded-lg sm:py-3.5">
              Try the free demo
            </a>
            <a href="/signs" className="rounded-xl border border-ink/15 bg-white/70 px-5 py-4 text-center text-sm font-semibold transition hover:border-ink/30 sm:rounded-lg sm:py-3.5">
              Sign dictionary
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
