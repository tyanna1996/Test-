import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Insights from './pages/Insights';
import Discover from './pages/Discover';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Discover is a standalone editorial page — it has its own dark nav */}
        <Route index element={<Discover />} />
        {/* App pages share the top nav layout */}
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="insights" element={<Insights />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
