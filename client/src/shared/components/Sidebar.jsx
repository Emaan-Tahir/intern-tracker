import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, Calendar, ClipboardCheck, UserPlus, Search, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

const internNavItems = [
  { icon: ClipboardList, label: 'My tasks', to: '/intern' },
  { icon: Calendar, label: 'This week', to: '/intern/this-week' },
];

const adminNavItems = [
  { icon: ClipboardCheck, label: 'Pending reviews', href: '#review-submissions' },
  { icon: UserPlus, label: 'Add new intern', href: '#onboard-intern' },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isIntern = user.role === 'intern';
  const navItems = isIntern ? internNavItems : adminNavItems;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onToggle} />}

      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-scroll">
          <div className="sidebar-top-row">
            <div className="sidebar-brand">
              <div className="sidebar-logo-box">P</div>
              <div>
                <p className="sidebar-brand-name">Internship Portal</p>
                <p className="sidebar-brand-sub">{isIntern ? 'Intern portal' : 'Admin console'}</p>
              </div>
            </div>
            <button className="sidebar-hamburger" onClick={onToggle} aria-label="Toggle sidebar">
              <Menu size={18} />
            </button>
          </div>

          <div className="sidebar-search">
            <Search size={14} />
            <span>Search...</span>
          </div>

          <p className="sidebar-section-label">Menu</p>

          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.href) {
                return (
                  <a key={item.label} href={item.href} className="sidebar-nav-item">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </a>
                );
              }
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <p className="sidebar-user-name">{user.name}</p>
              <p className="sidebar-user-role">{user.role === 'admin' ? 'Admin' : user.track || 'Intern'}</p>
            </div>
          </div>
          <button onClick={logout} className="btn sidebar-logout">
            <LogOut size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
