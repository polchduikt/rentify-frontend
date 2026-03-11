import type { ReactNode } from 'react';

interface AuthPageLayoutProps {
  photoUrl: string;
  imageAlt: string;
  overlayClassName: string;
  leftEyebrow: string;
  leftTitle: string;
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export const AuthPageLayout = ({
  photoUrl,
  imageAlt,
  overlayClassName,
  leftEyebrow,
  leftTitle,
  leftContent,
  rightContent,
}: AuthPageLayoutProps) => (
  <main className="bg-slate-100 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
    <div className="mx-auto w-full max-w-[1400px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
      <div className="flex min-h-[calc(100vh-13rem)]">
        <aside className="relative hidden w-[52%] shrink-0 lg:flex lg:flex-col lg:justify-end lg:p-10 xl:p-12">
          <img src={photoUrl} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
          <div className={`absolute inset-0 ${overlayClassName}`} />
          <div className="relative z-10 max-w-md">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">{leftEyebrow}</p>
            <h2 className="mb-5 text-[1.75rem] font-bold leading-tight text-white">{leftTitle}</h2>
            {leftContent}
          </div>
        </aside>

        <section className="flex flex-1 items-center justify-center bg-white px-6 py-8 sm:px-10 lg:px-14">
          <div className="w-full max-w-[420px]">{rightContent}</div>
        </section>
      </div>
    </div>
  </main>
);
