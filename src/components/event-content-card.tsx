import Image from "next/image";

interface EventContentCardProps {
  title: string;
  des: string;
  panel: string;
  img: string;
  reverse?: boolean;
  index?: number;
}

export function EventContentCard({ title, des, panel, img, reverse, index = 0 }: EventContentCardProps) {
  return (
    <div className={`flex flex-col items-center gap-10 lg:gap-16 ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
      <div className="group relative w-full max-w-md shrink-0">
        <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-brand-500/25 to-brand-700/5 opacity-50 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />
        <div className="relative h-[26rem] overflow-hidden rounded-[1.75rem] border border-gray-200 shadow-xl shadow-brand-800/10">
          <Image
            width={768}
            height={768}
            src={img}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-500 backdrop-blur">
            0{index + 1}
          </span>
        </div>
      </div>
      <div className="w-full">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">{panel}</p>
        <h3 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h3>
        <p className="mt-5 max-w-2xl leading-relaxed text-gray-600">{des}</p>
      </div>
    </div>
  );
}

export default EventContentCard;
