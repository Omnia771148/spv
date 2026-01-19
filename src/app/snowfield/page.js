'use client';

import { useState, useEffect } from 'react';

import { useRouter } from "next/navigation";
import { Data } from '../data/page';
import { ProductCard } from '../universaldisplay/page';
import { showToast } from '../../toaster/page';
import RestorentDisplay from "../restorentList/restnamedisplay";
import restuarents from "../restorentList/restuarentnamesdata";
import Navbar from '@/navigation/page';
import Loading from '../loading/page';


export default function KushasMenuLite() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ State to hold the distance
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    } else {
      // ✅ Pull the distance saved in RestaurantList
      const savedDistances = localStorage.getItem("allRestaurantDistances");
      if (savedDistances) {
        const distanceMap = JSON.parse(savedDistances);
        // restuarents[1] is "Snow Field" in your data
        const distValue = distanceMap["Snow Field"];
        if (distValue) {
          setDistance(`${distValue} km`);
        }
      }
      setLoading(false);
    }
  }, [router]);

  const addToCart = (item) => {
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    const isItemAlreadyInCart = existingCart.some(cartItem => cartItem.id === item.id);

    if (isItemAlreadyInCart) {
      showToast("Item already exists in the cart.", "danger");
      return;
    }

    // ✅ Logic to ensure items from only one restaurant are selected
    if (
      existingCart.some(cartItem => cartItem.id >= 1 && cartItem.id <= 4) ||
      existingCart.some(cartItem => cartItem.id >= 13 && cartItem.id <= 16) ||
      existingCart.some(cartItem => cartItem.id >= 17 && cartItem.id <= 20) ||
      existingCart.some(cartItem => cartItem.id >= 5 && cartItem.id <= 8)
    ) {
      showToast("You Can Select From Only One Restuarent", "danger");
      return; // Added return to prevent adding item if validation fails
    }

    // ✅ Tag the item with the restaurant name for the Cart page
    item.restaurantName = "Snow Field";

    const updatedCart = [...existingCart, item];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    showToast("Added to cart successfully!", "success");
  };


  if (loading) return <Loading />;
  return (
    <div className="container mt-4">

      {/* ✅ RESTAURANT CARD AT TOP WITH DISTANCE PASSING */}
      <div className="mb-4">
        <RestorentDisplay
          data={restuarents[1]}
          distance={distance || "Calculating..."}
        />
      </div>

      <h1 className="search">Search Dishes</h1>

      {/* Search Input */}
      <input
        type="text"
        className="search1 form-control mb-4"
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Filter by Type */}
      <h2 className="mt-4">Search Type</h2>
      <select
        id="restaurant"
        name="restaurant"
        className="form-select mb-4"
        onChange={(e) => setTypeFilter(e.target.value)}
        value={typeFilter}
      >
        <option value="">All</option>
        <option value="veg">Veg</option>
        <option value="non-veg">Non-Veg</option>
      </select>

      {/* Display Filtered Results */}
      <div className="row">
        {Data
          .filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
            const matchesType = typeFilter === '' || item.type === typeFilter;
            const matchesId = item.id >= 9 && item.id <= 12;
            return matchesSearch && matchesType && matchesId;
          })
          .map(item => (
            <ProductCard
              key={item.id}
              name={item.name}
              symbol={item.symbol}
              price={item.price}
              button={item.button}
              item={item}
              onAddToCart={addToCart}
            />
          ))
        }
      </div>

      <button
        className="btn btn-success w-100 py-2 mt-4 fw-bold"
        onClick={() => window.location.href = "/cart"}
      >
        GO TO CART
      </button>

      <Navbar />
    </div>
  );
}