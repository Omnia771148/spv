'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import './nav.css';

export default function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [cartCount, setCartCount] = useState(0); // State for cart count
  const lastScrollY = useRef(0);

  const updateCartCount = () => {
    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    }
  };

  // Use useRef to track the previous scroll position across renders without triggering them


  useEffect(() => {
    updateCartCount(); // Initial check

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show if near the top (e.g. within 50px) to ensure accessibility
      if (currentScrollY < 50) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      // Hysteresis: Only react if scroll difference is > 10px
      // This prevents "jitter" where tiny movements toggle the nav repeatedly
      if (Math.abs(diff) < 10) {
        return;
      }

      if (diff > 0) {
        // Scrolled DOWN
        setIsVisible(false);
      } else {
        // Scrolled UP
        setIsVisible(true);
      }

      // Update the "anchor" position only after a significant move
      lastScrollY.current = currentScrollY;
    };

    const handleCartUpdate = () => updateCartCount();

    // Use passive listener for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("cartUpdated", handleCartUpdate);
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
            {/* Show badge only for Cart item if count > 0 */}
            {item.name === 'Cart' && cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}