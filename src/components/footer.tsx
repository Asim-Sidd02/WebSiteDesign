import Image from "next/image";

const CURRENT_YEAR = new Date().getFullYear();
const LINKS = ["Company", "About Us", "Team", "Services", "Blog"];
const SOCIALS = ["twitter", "youtube", "instagram"];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand-950 px-6 py-10">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <Image src="/image/signsense.png" alt="SignSense logo" width={40} height={40} />
          <span className="font-bold text-white">SignSense</span>
        </div>
        <ul className="flex flex-wrap justify-center gap-6">
          {LINKS.map((link) => (
            <li key={link}>
              <a href="#" className="text-sm text-white/50 transition-colors hover:text-white">
                {link}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          {SOCIALS.map((s) => (
            <a
              key={s}
              href="#"
              aria-label={s}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-500 hover:text-white"
            >
              <i className={`fa-brands fa-${s}`} />
            </a>
          ))}
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-white/40">
        © {CURRENT_YEAR} SignSense. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
