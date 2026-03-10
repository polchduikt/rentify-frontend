import { Facebook, Home, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_CONTENT } from '@/constants/appContent';
import { ROUTES } from '@/config/routes';

const FOOTER_LINKS: Record<string, Array<{ label: string; to: string }>> = {
  Орендарям: [
    { label: 'Пошук оголошень', to: ROUTES.search },
    { label: 'Як це працює', to: ROUTES.about },
    { label: 'Конфіденційність', to: ROUTES.privacy },
  ],
  Власникам: [
    { label: 'Додати оголошення', to: ROUTES.createProperty },
    { label: 'Профіль', to: ROUTES.profile },
    { label: 'Умови користування', to: ROUTES.terms },
  ],
  Компанія: [
    { label: 'Про нас', to: ROUTES.about },
    { label: 'Контакти', to: ROUTES.contacts },
    { label: 'Підтримка', to: ROUTES.contacts },
  ],
};

const Footer = () => (
  <footer className="mt-auto bg-slate-900 text-slate-300">
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Link to={ROUTES.home} className="inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Home size={16} />
            </span>
            <span className="text-xl font-bold text-white">{APP_CONTENT.companyName}</span>
          </Link>

          <p className="max-w-sm text-sm text-slate-400">{APP_CONTENT.tagline}</p>

          <div className="space-y-2 text-sm text-slate-400">
            <p className="flex items-center gap-2">
              <Phone size={14} className="text-blue-400" />
              {APP_CONTENT.contacts.phone}
            </p>
            <p className="flex items-center gap-2">
              <Mail size={14} className="text-blue-400" />
              {APP_CONTENT.contacts.email}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={14} className="text-blue-400" />
              {APP_CONTENT.contacts.location}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            {[
              { icon: Facebook, href: APP_CONTENT.socialLinks.facebook, label: 'Facebook' },
              { icon: Instagram, href: APP_CONTENT.socialLinks.instagram, label: 'Instagram' },
              { icon: Youtube, href: APP_CONTENT.socialLinks.youtube, label: 'YouTube' },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 transition hover:bg-blue-600"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <h4 className="mb-4 text-sm font-semibold text-white">{title}</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-slate-400 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="border-t border-slate-800">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <p>
          &copy; {new Date().getFullYear()} {APP_CONTENT.companyName}. Усі права захищено.
        </p>
        <div className="flex items-center gap-4">
          <Link to={ROUTES.privacy} className="transition hover:text-slate-300">
            Конфіденційність
          </Link>
          <Link to={ROUTES.terms} className="transition hover:text-slate-300">
            Умови
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
