import type { PlaceholderPageProps } from './PlaceholderPage.types';

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => (
  <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{description}</p>
    </div>
  </div>
);

export default PlaceholderPage;
