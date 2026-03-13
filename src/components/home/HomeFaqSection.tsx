import { HOME_FAQ_ITEMS } from '@/constants/homePageContent';

const HomeFaqSection = () => (
  <section className="py-6">
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-3xl font-bold text-slate-900">FAQ</h2>
      <p className="mt-2 text-sm text-slate-600">Поширені запитання про пошук, бронювання та публікацію оголошень.</p>

      <div className="mt-6 space-y-3">
        {HOME_FAQ_ITEMS.map((item, index) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 open:bg-white"
            open={index === 0}
          >
            <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
              {item.question}
              <span className="float-right text-slate-400 transition group-open:rotate-45 group-open:text-slate-600">+</span>
            </summary>
            <p className="mt-3 pr-6 text-sm leading-relaxed text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default HomeFaqSection;
