import { useState } from 'react'
import { House, CircleDollarSign, FileText, User, Settings } from 'lucide-react'
import '../styles/nav.css'

// الترتيب من الشمال لليمين زي التصميم
const TABS = [
  { id: 'home', label: 'الرئيسية', Icon: House },
  { id: 'payments', label: 'المدفوعات', Icon: CircleDollarSign },
  { id: 'history', label: 'السجل', Icon: FileText },
  { id: 'profile', label: 'حسابي', Icon: User },
  { id: 'settings', label: 'الإعدادات', Icon: Settings },
]

export default function BottomNav() {
  const [active, setActive] = useState('home')

  return (
    <nav className="nav" dir="ltr" aria-label="التنقل الرئيسي">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id
        const fill = isActive ? (id === 'home' ? 'currentColor' : 'rgba(81, 43, 129, 0.18)') : 'none'
        return (
          <button
            key={id}
            type="button"
            className={`nav__btn${isActive ? ' nav__btn--active' : ''}`}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => setActive(id)}
          >
            <Icon size={32} strokeWidth={isActive ? 2.2 : 1.8} fill={fill} />
          </button>
        )
      })}
    </nav>
  )
}
