import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearToken } from '../api'

const navItems = [
  { to: '/admin', label: 'Дашборд', icon: '📊', end: true },
  { to: '/admin/leads', label: 'Заявки', icon: '📩' },
  { to: '/admin/projects', label: 'Проекты', icon: '📁' },
]

export default function Layout() {
  const navigate = useNavigate()

  const logout = () => {
    clearToken()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-bg-card border-r border-border flex flex-col">
        <div className="p-5 border-b border-border">
          <h1 className="text-lg font-bold text-primary">ASYSTEM AI</h1>
          <p className="text-xs text-text-secondary mt-1">Админ-панель</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/15 text-primary font-semibold'
                    : 'text-text-secondary hover:bg-bg-input hover:text-text'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-danger/15 hover:text-danger transition-colors cursor-pointer"
          >
            <span>🚪</span>
            Выйти
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
