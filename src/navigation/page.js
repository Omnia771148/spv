'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import './nav.css';

export default function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [cartCount, setCartCount] = useState(0); // State for cart count
  const [activeOrderCount, setActiveOrderCount] = useState(0); // State for active orders count
  const lastScrollY = useRef(0);

  const updateCartCount = () => {
    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    }
  };

  const updateActiveOrdersCount = async () => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          const res = await fetch(`/api/finalorderstatuses?userId=${userId}`);
          if (res.ok) {
            const orders = await res.json();
            // define active status logic if needed, but for now assuming all returned are 'active' until deleted
            // User said "if there is any item ... in second option ... it should be highlighted"
            setActiveOrderCount(orders.length);
          }
        } catch (e) {
          console.error("Failed to fetch active orders count", e);
        }
      }
    }
  };

  // Use useRef to track the previous scroll position across renders without triggering them


  useEffect(() => {
    updateCartCount(); // Initial check
    updateActiveOrdersCount();

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

    // Listen for order updates if we implement an event, otherwise just poll or rely on mount
    // For now, let's just inspect mount.

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
  if (pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/create-account' || pathname?.startsWith('/invoice')) {
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
            {/* Show badge for Orders item if count > 0 - Red Dot */}
            {item.name === 'Orders' && activeOrderCount > 0 && (
              <span className="cart-badge" style={{ minWidth: '20px', width: '20px', height: '20px', padding: 0, borderRadius: '50%', border: '2px solid white' }}></span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}