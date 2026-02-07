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
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurantStatuses, fetchItemStatuses, selectAllStatuses, selectRestaurantLoading, selectAllItemStatuses, selectItemLoading } from '../../../lib/features/restaurantSlice';
import { selectUser } from '../../../lib/features/userSlice';

import './sai.css';

export default function SaiMenu() {
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ Distance
    const [distance, setDistance] = useState(null);

    // ✅ Restaurant status (NEW - REDUX)
    const dispatch = useDispatch();
    const allStatuses = useSelector(selectAllStatuses);
    const isLoadingRedux = useSelector(selectRestaurantLoading);

    // ID "3" corresponds to Snow Field
    const restaurantActive = allStatuses["6"] ?? false;
    // If we have data, we are not "loading status" anymore. If Redux is fetching, use that.
    const statusLoading = Object.keys(allStatuses).length === 0 && isLoadingRedux;

    useEffect(() => {
        // If we landed here directly (refresh), store might be empty. Fetch it.
        if (Object.keys(allStatuses).length === 0) {
            dispatch(fetchRestaurantStatuses());
        }
    }, [dispatch, allStatuses]);

    // Button statuses state (REDUX)
    const buttonStatuses = useSelector(selectAllItemStatuses);
    const buttonStatusLoading = useSelector(selectItemLoading);

    // ✅ AUTH + DISTANCE
    const user = useSelector(selectUser);
    useEffect(() => {
        if (!user && !localStorage.getItem("userId")) {
            router.replace("/login");
        } else {
            const storedDistance = localStorage.getItem("currentRestaurantDistance");
            if (storedDistance) {
                setDistance(storedDistance);
            }
            setLoading(false);
        }
    }, [router, user]);

    // Ensure data fetch on mount (if direct link)
    useEffect(() => {
        if (Object.keys(allStatuses).length === 0) {
            dispatch(fetchRestaurantStatuses());
            dispatch(fetchItemStatuses());
        }
    }, [dispatch, allStatuses]);


    // Removed manual fetch button statuses useEffect

    // ✅ ADD TO CART
    const addToCart = (item) => {
        // ✅ Cached Service Check (No API Call)
        const serviceStatus = localStorage.getItem("isServiceAvailable");
        if (serviceStatus === "false") {
            showToast("Service Unavailable: You are outside the service area.", "danger");
            return;
        }

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
            existingCart.some((cartItem) => cartItem.id >= 1 && cartItem.id <= 100) ||
            existingCart.some((cartItem) => cartItem.id >= 101 && cartItem.id <= 205) ||
            existingCart.some((cartItem) => cartItem.id >= 206 && cartItem.id <= 310) ||
            existingCart.some((cartItem) => cartItem.id >= 311 && cartItem.id <= 411) ||
            existingCart.some((cartItem) => cartItem.id >= 412 && cartItem.id <= 512) ||
            existingCart.some((cartItem) => cartItem.id >= 614 && cartItem.id <= 714)
        ) {
            showToast("You Can Select From Only One Restaurant", "danger");
            return;
        }

        item.restaurantName = "sai";
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
                    data={restuarents[5]}
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
                    const matchesId = item.id >= 513 && item.id <= 613; ///cange for the item statuses
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
                    const matchesId = item.id >= 513 && item.id <= 613; ///cange for the item statuses
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
