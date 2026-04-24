import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';

export default function Layout() {
  return (
    <div className="flex flex-col h-full bg-bg-primary">
      <Topbar />
      <main id="main-content" className="flex-1 overflow-y-auto" role="main">
        <Outlet />
      </main>
    </div>
  );
}
