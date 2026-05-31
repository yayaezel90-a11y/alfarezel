type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  inverse?: boolean;
};

export function SectionHeading({ eyebrow, title, description, action, inverse = false }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className={inverse ? "text-sm font-bold uppercase text-blue-200" : "text-sm font-bold uppercase text-blue-700"}>{eyebrow}</p> : null}
        <h2 className={inverse ? "mt-2 text-2xl font-black text-white sm:text-3xl" : "mt-2 text-2xl font-black text-slate-950 sm:text-3xl"}>{title}</h2>
        {description ? <p className={inverse ? "mt-3 text-sm leading-6 text-slate-300 sm:text-base" : "mt-3 text-sm leading-6 text-slate-600 sm:text-base"}>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
