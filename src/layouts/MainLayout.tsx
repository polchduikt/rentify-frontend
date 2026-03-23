import { Outlet } from 'react-router-dom';
import Footer from '@/components/footer/Footer.tsx';
import Navbar from '@/components/navbar/Navbar.tsx';
import { FloatingChatWidget } from '@/components/chat';

const MainLayout = () => (
  <div className="flex min-h-screen flex-col bg-slate-50">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <FloatingChatWidget />
  </div>
);

export default MainLayout;
