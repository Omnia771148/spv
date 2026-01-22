'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Data } from '../data/page';
import { ProductCard } from '../universaldisplay/page';
import { showToast } from '../../toaster/page';

import RestorentDisplay from "../restorentList/restnamedisplay";
import restuarents from "../restorentList/restuarentnamesdata";
import Navbar from '@/navigation/page';
import Loading from '../loading/page';

import './kushas.css';

export default function KushasMenuList() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cart, setCart] = useState([]);

  // ✅ Restaurant status states
  const [restaurantActive, setRestaurantActive] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  // ✅ Authentication check
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  // ✅ Fetch restaurant status (KUSHAS)
  useEffect(() => {
    const fetchRestaurantStatus = async () => {
      try {
        const res = await fetch("/api/restaurant/kushas");
        const data = await res.json();
        setRestaurantActive(data.isActive);
      } catch (err) {
        console.error("Error fetching restaurant status");
      } finally {
        setStatusLoading(false);
      }
    };

    fetchRestaurantStatus();
  }, []);

  // ✅ Add item to cart (WITH STATUS CHECK)
  const addToCart = (item) => {
    if (!restaurantActive) {
      showToast("Restaurant is currently not accepting orders", "danger");
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];

    if (existingCart.some(cartItem => cartItem.id === item.id)) {
      showToast("Item already exists in the cart.", "danger");
      return;
    }

    // ✅ One restaurant restriction
    if (
      existingCart.some(cartItem => cartItem.id >= 5 && cartItem.id <= 8) ||
      existingCart.some(cartItem => cartItem.id >= 9 && cartItem.id <= 12) ||
      existingCart.some(cartItem => cartItem.id >= 13 && cartItem.id <= 16) ||
      existingCart.some(cartItem => cartItem.id >= 17 && cartItem.id <= 20)
    ) {
      showToast("You Can Select From Only One Restaurant", "danger");
      return;
    }

    item.restaurantName = "Kushas";

    const updatedCart = [...existingCart, item];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    showToast("Added to cart successfully!");
  };

  if (loading) return <Loading />;

  return (
    <div className="restaurant-page-bg container mt-4">

      {/* ✅ RESTAURANT CARD */}
      <RestorentDisplay data={restuarents[2]} className="col-12 mb-4" />

      {statusLoading && (
        <div className="alert alert-warning mt-3">
          Checking restaurant status...
        </div>
      )}

      {!statusLoading && !restaurantActive && (
        <div className="alert alert-danger mt-3">
          Restaurant is currently CLOSED
        </div>
      )}

      <div className="filter-section mb-4 mt-4">
        <div className="search-input-group">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            className="custom-search-input"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="toggle-group d-flex align-items-center">
          {/* All Button */}
          <button
            className={`toggle-btn ${typeFilter === '' ? 'active-all' : ''}`}
            onClick={() => setTypeFilter('')}
            title="All"
          >
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>All</span>
          </button>

          {/* Veg Button */}
          <button
            className={`toggle-btn veg-btn ${typeFilter === 'veg' ? 'active-veg' : ''}`}
            onClick={() => setTypeFilter('veg')}
            title="Veg"
          >
            <i className="fa-solid fa-leaf"></i>
          </button>

          {/* Non-Veg Button */}
          <button
            className={`toggle-btn nonveg-btn ${typeFilter === 'non-veg' ? 'active-nonveg' : ''}`}
            onClick={() => setTypeFilter('non-veg')}
            title="Non-Veg"
          >
            <i className="fa-solid fa-drumstick-bite"></i>
          </button>
        </div>
      </div>

      <div className="row">
        {Data.filter(item => {
          const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
          const matchesType = typeFilter === '' || item.type === typeFilter;
          const matchesId = item.id >= 1 && item.id <= 4;
          return matchesSearch && matchesType && matchesId;
        }).map(item => (
          <ProductCard
            key={item.id}
            item={item}
            name={item.name}
            symbol={item.symbol}
            price={item.price}
            button={item.button}
            onAddToCart={addToCart}
            disabled={!restaurantActive}
            image={item.image}
          />
        ))}
      </div>



      <Navbar />
    </div>
  );
}
