import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { HomeSectionHeaderProps } from './HomeSectionHeader.types';


const HomeSectionHeader = ({ title, subtitle, linkTo }: HomeSectionHeaderProps) => (
  <div className="mb-6 flex items-end justify-between gap-4">
    <div>
      <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
    <Link
      to={linkTo}
      className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-blue-600 transition hover:text-blue-700"
    >
      Всі оголошення <ArrowRight size={16} />
    </Link>
  </div>
);

export default HomeSectionHeader;
