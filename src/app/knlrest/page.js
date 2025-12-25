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

export default function KushasMenuList() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [cart, setCart] = useState([]);

  // 🔴 SAFE DEFAULTS (NO FLICKER)
  const [restaurantActive, setRestaurantActive] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  // ✅ AUTH CHECK (UNCHANGED)
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  // ✅ FETCH RESTAURANT STATUS (ONLY ADDITION)
  useEffect(() => {
    const fetchRestaurantStatus = async () => {
      try {
        const res = await fetch("/api/restaurant/status");
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

  // ✅ ADD TO CART (UNCHANGED LOGIC)
  const addToCart = (item) => {

    // 🔴 BLOCK IF CLOSED
    if (!restaurantActive) {
      showToast("Restaurant is currently not accepting orders", "danger");
      return;
    }

    const existingCart =
      JSON.parse(localStorage.getItem("cart")) || [];

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

    const updatedCart = [...existingCart, item];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    showToast("Added to cart successfully!");
  };

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  return (
    <div className="container mt-4">

      {/* ✅ RESTAURANT CARD (UNCHANGED) */}
      <div className="mb-4">
        <RestorentDisplay data={restuarents[0]} />

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
      </div>

      <h1 className="search">Search Dishes</h1>

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
        {Data.filter((item) => {
          const matchesSearch = item.name
            .toLowerCase()
            .includes(search.toLowerCase());
          const matchesType =
            typeFilter === "" || item.type === typeFilter;
          const matchesId = item.id >= 5 && item.id <= 8;

          return matchesSearch && matchesType && matchesId;
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
          />
        ))}
      </div>

      <button
        className="btn btn-success mt-3"
        onClick={() => (window.location.href = "/cart")}
      >
        GO TO CART
      </button>

      <Navbar />
    </div>
  );
}
