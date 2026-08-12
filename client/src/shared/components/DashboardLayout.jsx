import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="app-shell">
      <Sidebar isOpen={isOpen} onToggle={() => setIsOpen((o) => !o)} />

      {!isOpen && (
        <button
          className="sidebar-reopen-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
      )}

      <main className={`dashboard-main ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`} id="top">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
