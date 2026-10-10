import { useState } from 'react'
import { House, Wallet, Receipt, UserCircle, GearSix } from '@phosphor-icons/react'
import '../styles/nav.css'

// الترتيب من الشمال لليمين زي التصميم
const TABS = [
  { id: 'home', label: 'الرئيسية', Icon: House },
  { id: 'payments', label: 'المدفوعات', Icon: Wallet },
  { id: 'history', label: 'السجل', Icon: Receipt },
  { id: 'profile', label: 'حسابي', Icon: UserCircle },
  { id: 'settings', label: 'الإعدادات', Icon: GearSix },
]

export default function BottomNav() {
  const [active, setActive] = useState('home')

  return (
    <nav className="nav" dir="ltr" style={{ '--i': TABS.findIndex((t) => t.id === active) }} aria-label="التنقل الرئيسي">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            className={`nav__btn${isActive ? ' nav__btn--active' : ''}`}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => setActive(id)}
          >
            <Icon size={26} weight={isActive ? 'fill' : 'light'} />
          </button>
        )
      })}
    </nav>
  )
}
