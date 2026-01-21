'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './nav.css';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/mainRestorentList', icon: 'fa-house' },
    { name: 'Orders', href: '/finalorderstatuses', icon: 'fa-person-biking' }, // Using bike for delivery status
    { name: 'Cart', href: '/cart', icon: 'fa-bag-shopping' },
    { name: 'Profile', href: '/Profile', icon: 'fa-user' },
  ];

  return (
    <nav className="navbar-container">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <i className={`fa-solid ${item.icon} nav-icon`}></i>
          </Link>
        );
      })}
    </nav>
  );
}