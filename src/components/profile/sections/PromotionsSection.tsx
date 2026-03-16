import { Wallet } from 'lucide-react';
import { usePromotionsSectionModel } from '@/hooks/profile/usePromotionsSectionModel';
import { formatMoney } from '@/utils/profileFormatters';
import { Notice } from '../Notice';
import type { PromotionsSectionProps } from './PromotionsSection.types';
import { SubscriptionFlow } from './promotions/SubscriptionFlow';
import { TopPromotionsFlow } from './promotions/TopPromotionsFlow';

export const PromotionsSection = (props: PromotionsSectionProps) => {
  const model = usePromotionsSectionModel(props);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{model.headerTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{model.headerDescription}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <Wallet size={13} />
          Баланс: {formatMoney(model.walletBalance, model.walletCurrency)}
        </span>
      </div>

      {model.notice ? <Notice type={model.notice.type} message={model.notice.message} /> : null}

      {model.mode === 'promotions-top' ? <TopPromotionsFlow model={model} /> : null}
      {model.mode === 'promotions-subscriptions' ? <SubscriptionFlow model={model} /> : null}
    </section>
  );
};
