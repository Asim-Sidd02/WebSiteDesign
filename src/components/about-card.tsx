import React from "react";

interface AboutCardProp {
  title: string;
  subTitle?: string;
  description: string;
  icon?: React.ElementType;
}

export function AboutCard({ title, description, icon: Icon }: AboutCardProp) {
  return (
    <div className="group relative h-full overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-[0_24px_60px_-24px_rgba(47,47,228,0.35)] lg:p-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
      {Icon && (
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30 transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110">
          <Icon className="h-6 w-6 text-white" />
        </div>
      )}
      <h3 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h3>
      <p className="mt-4 leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}

export default AboutCard;
