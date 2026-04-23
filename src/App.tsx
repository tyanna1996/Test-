import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Insights from './pages/Insights';
import Discover from './pages/Discover';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="insights" element={<Insights />} />
          <Route path="discover" element={<Discover />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
