'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import 'bootstrap/dist/css/bootstrap.min.css';

import { Data } from '../data/page';
import { ProductCard } from '../universaldisplay/page';
import { showToast } from '../../toaster/page'; 
import RestorentDisplay from "../restorentList/restnamedisplay";
import restuarents from "../restorentList/restuarentnamesdata";
import Navbar from '@/navigation/page';
// ✅ Import your custom Loading component
import Loading from "../loading/page"; 

export default function LajeshMenuList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cart, setCart] = useState([]);
  const [restaurantActive, setRestaurantActive] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  // ✅ Authentication Check
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  // ✅ Fetch Restaurant Status
  useEffect(() => {
    const fetchRestaurantStatus = async () => {
      try {
        const res = await fetch("/api/restaurant/status");
        const data = await res.json();
        setRestaurantActive(data.isActive);
      } catch (error) {
        setRestaurantActive(true); // Fallback to true if API fails
      } finally {
        setStatusLoading(false);
      }
    };
    fetchRestaurantStatus();
  }, []);

  const addToCart = (item) => {
    if (!restaurantActive) {
      showToast("Restaurant is currently closed", "danger");
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];

    if (existingCart.some(cartItem => cartItem.id === item.id)) {
      showToast("Item already exists in the cart.", "danger");
      return;
    }

    const hasOtherRestaurantItems = 
      existingCart.some(cartItem => cartItem.id >= 1 && cartItem.id <= 12) || 
      existingCart.some(cartItem => cartItem.id >= 17 && cartItem.id <= 20);

    if (hasOtherRestaurantItems) {
      showToast("You Can Select From Only One Restaurant", "danger");
      return;
    }

    item.restaurantName = "lajesh"; 
    const updatedCart = [...existingCart, item];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    showToast("Added to cart successfully!");
  };

  // ✅ Swapped the text paragraph for your custom Pizza Loading component
  if (loading) return <Loading />;

  return (
    <div className="container mt-4">
      <div className="mb-4">
        {restuarents && restuarents[3] ? (
          <RestorentDisplay data={restuarents[3]} />
        ) : (
          <p className="text-danger">Loading restaurant data...</p>
        )}
        
        {!statusLoading && !restaurantActive && (
          <div className="alert alert-danger mt-3">Restaurant is currently CLOSED</div>
        )}
      </div>

      <h1 className="search mt-4">Search Dishes</h1>
      <input
        type="text"
        className="form-control mb-4"
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="row">
        {Data
          .filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
            const matchesType = typeFilter === '' || item.type === typeFilter;
            const matchesId = item.id >= 13 && item.id <= 16;
            return matchesSearch && matchesType && matchesId;
          })
          .map(item => (
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
          ))
        }
      </div>

      <button className="btn btn-success w-100 py-2 mt-3" onClick={() => router.push("/cart")}>
        GO TO CART
      </button>
      <Navbar />
    </div>
  );
}