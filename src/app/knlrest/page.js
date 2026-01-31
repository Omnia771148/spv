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

import './knlrest.css';

export default function KushasMenuList() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [cart, setCart] = useState([]);



  // ✅ REDUX INTEGRATION
  const dispatch = useDispatch();
  const allStatuses = useSelector(selectAllStatuses);
  const isLoadingRedux = useSelector(selectRestaurantLoading);

  // Item (Button) Statuses
  const buttonStatuses = useSelector(selectAllItemStatuses);
  const buttonStatusLoading = useSelector(selectItemLoading);

  // ID "2" corresponds to KNL based on API verification
  const restaurantActive = allStatuses["2"] ?? false;
  // If we have data, we are not "loading status" anymore. If Redux is fetching, use that.
  const statusLoading = Object.keys(allStatuses).length === 0 && isLoadingRedux;

  useEffect(() => {
    // If we landed here directly (refresh), store might be empty. Fetch it.
    if (Object.keys(allStatuses).length === 0) {
      dispatch(fetchRestaurantStatuses());
      dispatch(fetchItemStatuses()); // Ensure items are also fetched
    }
  }, [dispatch, allStatuses]);

  // ✅ REDUX AUTH CHECK
  const user = useSelector(selectUser);
  useEffect(() => {
    if (!user && !localStorage.getItem("userId")) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router, user]);

  // Removed manual Fetch button statuses useEffect

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
      existingCart.some((cartItem) => cartItem.id >= 13 && cartItem.id <= 16) ||
      existingCart.some((cartItem) => cartItem.id >= 17 && cartItem.id <= 20)
    ) {
      showToast("You Can Select From Only One Restaurant", "danger");
      return;
    }

    item.restaurantName = "KNL";
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
        <RestorentDisplay data={restuarents[0]} className="col-12 mb-4" />

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
          const matchesId = item.id >= 5 && item.id <= 8; ///cange for the item statuses
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
          const matchesId = item.id >= 5 && item.id <= 8; ///cange for the item statuses
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
