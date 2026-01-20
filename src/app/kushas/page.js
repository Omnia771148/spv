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
    <div className="container mt-4" style={{ paddingBottom: '80px' }}>

      {/* ✅ RESTAURANT CARD */}
      <RestorentDisplay data={restuarents[2]} />

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

      <h1 className="search mt-4">Search Dishes</h1>

      <input
        type="text"
        className="search1 form-control mb-4"
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <h2 className="mt-4">Search Type</h2>
      <select
        className="form-select mb-4"
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
      >
        <option value="">All</option>
        <option value="veg">Veg</option>
        <option value="non-veg">Non-Veg</option>
      </select>

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
          />
        ))}
      </div>

      <button
        className="btn btn-success w-100 py-2 mt-4 fw-bold"
        onClick={() => router.push("/cart")}
      >
        GO TO CART
      </button>

      <Navbar />
    </div>
  );
}
