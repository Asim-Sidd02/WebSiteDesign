import { Navbar, Footer } from "@/components";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className="relative overflow-hidden">
                <section className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-5 pb-20 pt-28 sm:px-8">
          <p className="label">Error 404</p>
          <h1 className="display mt-5 max-w-3xl text-[2.85rem] sm:text-7xl">
            This page isn’t here.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-ink/60 sm:text-lg sm:leading-8">
            The link may be old or mistyped. You can go back home, try the free avatar demo, or look up a word in the sign dictionary.
          </p>
          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <a href="/" className="btn-primary">
              Back to home
            </a>
            <a href="/demo" className="btn-secondary">
              Try the free demo
            </a>
            <a href="/signs" className="btn-secondary">
              Sign dictionary
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
