import { CheckCircle2, Compass, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HOME_WORKFLOW_STEPS } from '@/constants/homePageContent';
import { ROUTES } from '@/config/routes';

const HomeHowItWorksSection = () => (
  <section className="py-6">
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold text-slate-900">Як це працює</h2>
        <Link
          to={ROUTES.search}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Почати пошук
          <Compass size={16} />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {HOME_WORKFLOW_STEPS.map((step, index) => {
          const StepIcon = index === 0 ? Compass : index === 1 ? CheckCircle2 : ShieldCheck;
          return (
            <article key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <StepIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

export default HomeHowItWorksSection;
