import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';

export default function AppLayout() 
{
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
