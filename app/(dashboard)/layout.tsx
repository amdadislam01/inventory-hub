import Sidebar from '@/components/ui/Sidebar';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row w-full h-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
