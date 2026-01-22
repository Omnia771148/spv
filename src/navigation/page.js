'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import './nav.css';

export default function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up or at top
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navItems = [
    { name: 'Home', href: '/mainRestorentList', icon: 'fa-house' },
    { name: 'Orders', href: '/finalorderstatuses', icon: 'fa-person-biking' },
    { name: 'Cart', href: '/cart', icon: 'fa-bag-shopping' },
    { name: 'Profile', href: '/Profile', icon: 'fa-user' },
  ];

  // Hide Navbar on specific pages
  if (pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/create-account') {
    return null;
  }

  return (
    <nav className={`navbar-container ${isVisible ? 'nav-visible' : 'nav-hidden'}`}>
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