"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Data } from "../data/page";
import { ProductCard } from "../universaldisplay/page";
import { showToast } from "../../toaster/page";
import RestorentDisplay from "../restorentList/restnamedisplay";
import restuarents from "../restorentList/restuarentnamesdata";
import Navbar from "@/navigation/page";
// ✅ Fixed Import: Capitalized 'Loading'
import Loading from '../loading/page';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurantStatuses, fetchItemStatuses, selectAllStatuses, selectRestaurantLoading, selectAllItemStatuses, selectItemLoading } from '../../../lib/features/restaurantSlice';
import { selectUser } from '../../../lib/features/userSlice';

import './maurya.css';

export default function Mayuri() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [cart, setCart] = useState([]);

  // 🔴 SAFE DEFAULTS (NO FLICKER)
  const dispatch = useDispatch();
  const allStatuses = useSelector(selectAllStatuses);
  const isLoadingRedux = useSelector(selectRestaurantLoading);

  // ID "5" corresponds to Mayuri
  const restaurantActive = allStatuses["5"] ?? false;
  const statusLoading = Object.keys(allStatuses).length === 0 && isLoadingRedux;

  // Button statuses state (REDUX)
  const buttonStatuses = useSelector(selectAllItemStatuses);
  const buttonStatusLoading = useSelector(selectItemLoading);

  useEffect(() => {
    if (Object.keys(allStatuses).length === 0) {
      dispatch(fetchRestaurantStatuses());
      dispatch(fetchItemStatuses());
    }
  }, [dispatch, allStatuses]);

  // ✅ AUTH CHECK (UNCHANGED)
  const user = useSelector(selectUser);
  useEffect(() => {
    if (!user && !localStorage.getItem("userId")) {
      router.replace("/login");
    } else {
      setLoading(false);
    }
  }, [router, user]);

  // Removed manual fetch button statuses logic

  // ✅ ADD TO CART (UNCHANGED LOGIC)
  const addToCart = (item) => {
    // 🔴 BLOCK IF CLOSED
    if (!restaurantActive) {
      showToast("Restaurant is currently not accepting orders", "danger");
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

    const isItemAlreadyInCart = existingCart.some(
      (cartItem) => cartItem.id === item.id
    );

    if (isItemAlreadyInCart) {
      showToast("Item already exists in the cart.", "danger");
      return;
    }

    if (
      existingCart.some((cartItem) => cartItem.id >= 9 && cartItem.id <= 12) ||
      existingCart.some((cartItem) => cartItem.id >= 1 && cartItem.id <= 4) ||
      existingCart.some((cartItem) => cartItem.id >= 5 && cartItem.id <= 8) ||
      existingCart.some((cartItem) => cartItem.id >= 13 && cartItem.id <= 16)
    ) {
      showToast("You Can Select From Only One Restaurant", "danger");
      return;
    }

    item.restaurantName = "mayuri";
    const updatedCart = [...existingCart, item];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated")); // Notify Navbar
    showToast("Added to cart successfully!");
  };

  // ✅ Corrected Loading placement
  if (loading || buttonStatusLoading) return <Loading />;

  return (
    <div className="restaurant-page-bg container mt-4">
      {/* ✅ RESTAURANT CARD */}
      <div className="mb-4">
        <RestorentDisplay data={restuarents[4]} className="col-12 mb-4" />

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
        {Data.filter((item) => {
          const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
          const matchesType = typeFilter === "" || item.type === typeFilter;
          const matchesId = item.id >= 17 && item.id <= 20; ///cange for the item statuses
          const isActive = buttonStatuses[item.id] === true;

          return matchesSearch && matchesType && matchesId && isActive;
        }).map((item) => (
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
          const matchesType = typeFilter === "" || item.type === typeFilter;
          const matchesId = item.id >= 17 && item.id <= 20; ///cange for the item statuses
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
