import { Check, Lock } from 'lucide-react';
import { PROPERTY_CREATE_STEP_DESCRIPTIONS, PROPERTY_CREATE_STEP_TITLES } from '@/constants/propertyCreateUi';
import type { CreatePropertySidebarProps } from './CreatePropertySidebar.types';


export const CreatePropertySidebar = ({ step, stepLocks, onStepClick }: CreatePropertySidebarProps) => (
  <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Майстер оголошення</p>
    <h1 className="mt-2 text-xl font-bold text-slate-900">Створення нового об’єкта</h1>
    <p className="mt-2 text-sm text-slate-500">{PROPERTY_CREATE_STEP_DESCRIPTIONS[step]}</p>

    <div className="mt-6 space-y-2">
      {PROPERTY_CREATE_STEP_TITLES.map((title, index) => {
        const isActive = index === step;
        const isPassed = index < step;
        const isLocked = stepLocks[index];

        return (
          <button
            key={title}
            type="button"
            onClick={() => onStepClick(index)}
            disabled={isLocked}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
              isActive ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                isPassed
                  ? 'bg-emerald-500 text-white'
                  : isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600'
              }`}
            >
              {isPassed ? <Check size={14} /> : index + 1}
            </span>
            <span className={`flex-1 text-sm ${isActive ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{title}</span>
            {isLocked ? <Lock size={14} className="text-slate-400" /> : null}
          </button>
        );
      })}
    </div>
  </aside>
);
