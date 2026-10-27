import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';

export default function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F8FF' }}>
      <TopNav />
      <main id="main-content" role="main" style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
