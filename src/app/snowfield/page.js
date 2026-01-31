'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Data } from '../data/page';
import { ProductCard } from '../universaldisplay/page';
import { showToast } from '../../toaster/page';
import RestorentDisplay from "../restorentList/restnamedisplay";
import restuarents from "../restorentList/restuarentnamesdata";

import Loading from '../loading/page';
import Navbar from '../../navigation/page';

import './snowfield.css';

export default function KushasMenuLite() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Distance
  const [distance, setDistance] = useState(null);

  // ✅ Restaurant status (NEW)
  const [restaurantActive, setRestaurantActive] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  // Button statuses state
  const [buttonStatuses, setButtonStatuses] = useState({});
  const [buttonStatusLoading, setButtonStatusLoading] = useState(true);

  // ✅ AUTH + DISTANCE
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.replace("/login");
    } else {
      const savedDistances = localStorage.getItem("allRestaurantDistances");
      if (savedDistances) {
        const distanceMap = JSON.parse(savedDistances);
        const distValue = distanceMap["Snow Field"];
        if (distValue) {
          setDistance(`${distValue} km`);
        }
      }
      setLoading(false);
    }
  }, [router]);

  // ✅ FETCH RESTAURANT STATUS (NEW)
  useEffect(() => {
    const fetchRestaurantStatus = async () => {
      try {
        // Optimization: Check if status was passed from the previous page
        const cachedStatus = localStorage.getItem("currentRestaurantStatus");
        if (cachedStatus !== null && cachedStatus !== undefined) {
          setRestaurantActive(cachedStatus === "true" || cachedStatus === true);
          setStatusLoading(false);
          return;
        }

        const res = await fetch("/api/restaurant/snow");
        const data = await res.json();
        setRestaurantActive(data.isActive);
      } catch (error) {
        console.error("Error fetching restaurant status");
      } finally {
        setStatusLoading(false);
      }
    };

    fetchRestaurantStatus();
  }, []);

  // Fetch button statuses
  useEffect(() => {
    const fetchButtonStatuses = async () => {
      try {
        const res = await fetch("/api/button-status");
        if (res.ok) {
          const data = await res.json();
          const statusMap = {};
          data.forEach(s => {
            statusMap[s.buttonId] = s.isActive;
          });
          setButtonStatuses(statusMap);
        }
      } catch (error) {
        console.error("Error fetching button statuses", error);
      } finally {
        setButtonStatusLoading(false);
      }
    };
    fetchButtonStatuses();
  }, []);

  // ✅ ADD TO CART (WITH STATUS BLOCK)
  const addToCart = (item) => {
    if (!restaurantActive) {
      showToast("Restaurant is currently not accepting orders", "danger");
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    const isItemAlreadyInCart = existingCart.some(
      cartItem => cartItem.id === item.id
    );

    if (isItemAlreadyInCart) {
      showToast("Item already exist", "danger");
      return;
    }

    if (
      existingCart.some(cartItem => cartItem.id >= 1 && cartItem.id <= 4) ||
      existingCart.some(cartItem => cartItem.id >= 5 && cartItem.id <= 8) ||
      existingCart.some(cartItem => cartItem.id >= 13 && cartItem.id <= 16) ||
      existingCart.some(cartItem => cartItem.id >= 17 && cartItem.id <= 20)
    ) {
      showToast("You Can Select From Only One Restaurant", "danger");
      return;
    }

    item.restaurantName = "Snow Field";
    const updatedCart = [...existingCart, item];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated")); // Notify Navbar
    showToast("ITEM ADDED", "success");
  };

  if (loading || buttonStatusLoading) return <Loading />;

  return (
    <div className="kushas-page container mt-4">

      {/* ✅ RESTAURANT CARD */}
      <div className="mb-4">
        <RestorentDisplay
          data={restuarents[1]}
          distance={distance || "Calculating..."}
          className="col-12 mb-4"
        />

        {statusLoading && (
          <div className="alert alert-warning mt-3">
            Checking restaurant status...
          </div>
        )}

        {!statusLoading && !restaurantActive && (
          <div className="reststatus">
            Restaurant is currently CLOSED
          </div>
        )}
      </div>

      <div className="filter-section mb-4">
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
          const matchesId = item.id >= 9 && item.id <= 12; ///cange for the item statuses
          const isActive = buttonStatuses[item.id] === true;

          return matchesSearch && matchesType && matchesId && isActive;
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
        {Data.filter((item) => {
          const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
          const matchesType = typeFilter === '' || item.type === typeFilter;
          const matchesId = item.id >= 9 && item.id <= 12; ///cange for the item statuses
          const isActive = buttonStatuses[item.id] === true;
          return matchesSearch && matchesType && matchesId && isActive;
        }).length === 0 && (
            <div className="col-12 text-center text-muted">
              No active items available.
            </div>
          )}
      </div>



      <Navbar />
    </div>
  );
}
