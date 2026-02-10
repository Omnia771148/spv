'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Carousel, Modal, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurantStatuses, fetchItemStatuses, selectAllStatuses } from '../../../lib/features/restaurantSlice';

import './restorentList.css';
import { restList } from './restorentDtata';
import { Data } from '../data/page';
import RestorentDisplay from './restorentDisplay';
import { useRouter } from "next/navigation";
import Navbar from '@/navigation/page';
import { getDistance } from "geolib";
import { getExactDistance } from '../actions/delivery';
import Loading from "../loading/page";

export default function RestorentList() {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [mounted, setMounted] = useState(false);
    
    // SIMPLE STATES
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showFetchingModal, setShowFetchingModal] = useState(false);
    const [roadDistances, setRoadDistances] = useState({});

    const router = useRouter();
    const dispatch = useDispatch();
    const restaurantStatuses = useSelector(selectAllStatuses);

    // SIMPLE FUNCTION TO TRIGGER CHROME PERMISSION DIALOG
    const triggerChromePermission = () => {
        console.log("🎯 Triggering Chrome location permission...");
        
        // Close first modal, show fetching modal
        setShowLocationModal(false);
        setShowFetchingModal(true);
        
        // THIS WILL TRIGGER CHROME'S NATIVE PERMISSION DIALOG
        if (!navigator.geolocation) {
            console.error("Geolocation not supported");
            setShowFetchingModal(false);
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                console.log("✅ Chrome permission GRANTED!");
                const { latitude, longitude } = position.coords;
                
                // Save coordinates
                localStorage.setItem("customerLat", latitude);
                localStorage.setItem("customerLng", longitude);
                
                // Calculate distances for ALL restaurants
                console.log("📍 Calculating distances...");
                const distances = {};
                
                for (const restaurant of restList) {
                    try {
                        // Use your exact distance API
                        const data = await getExactDistance(
                            { lat: latitude, lng: longitude },
                            { lat: restaurant.lat, lng: restaurant.lng }
                        );
                        
                        if (data && data.km) {
                            distances[restaurant.name] = data.km;
                        } else {
                            // Fallback to direct distance
                            const directDistance = getDistance(
                                { latitude, longitude },
                                { latitude: restaurant.lat, longitude: restaurant.lng }
                            );
                            distances[restaurant.name] = (directDistance / 1000).toFixed(1);
                        }
                    } catch (error) {
                        console.error(`Error calculating distance for ${restaurant.name}:`, error);
                        // Fallback distance
                        const directDistance = getDistance(
                            { latitude, longitude },
                            { latitude: restaurant.lat, longitude: restaurant.lng }
                        );
                        distances[restaurant.name] = (directDistance / 1000).toFixed(1);
                    }
                }
                
                // Save and show distances
                setRoadDistances(distances);
                localStorage.setItem("allRestaurantDistances", JSON.stringify(distances));
                console.log("📊 Distances calculated:", distances);
                
                // Close modal
                setShowFetchingModal(false);
            },
            (error) => {
                console.log("❌ Chrome permission result:", error.message);
                setShowFetchingModal(false);
                
                if (error.code === 1) {
                    // User clicked BLOCK in Chrome dialog
                    alert("You blocked location access. Please allow location in Chrome settings to see distances.");
                } else {
                    // Other error (GPS off, timeout, etc.)
                    alert("Could not get location. Please ensure GPS is enabled and try again.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    // Handle "Turn On Location" button click
    const handleEnableLocation = () => {
        console.log("🖱️ Button clicked - Calling Chrome permission...");
        triggerChromePermission();
    };

    useEffect(() => {
        setMounted(true);

        // Check if user is logged in
        if (!localStorage.getItem("userId")) {
            router.replace("/login");
            return;
        }

        // Fetch restaurant statuses
        dispatch(fetchRestaurantStatuses());
        dispatch(fetchItemStatuses());

        // Auto-refresh status every 20 seconds
        const intervalId = setInterval(() => {
            dispatch(fetchRestaurantStatuses());
            dispatch(fetchItemStatuses());
        }, 20000);

        // Check if we already have distances cached
        const savedDistances = localStorage.getItem("allRestaurantDistances");
        
        if (savedDistances) {
            try {
                const parsed = JSON.parse(savedDistances);
                setRoadDistances(parsed);
                console.log("✅ Using cached distances:", parsed);
            } catch (e) {
                console.error("Error loading cached distances:", e);
            }
            setLoading(false);
        } else {
            // No cached distances - show location modal
            console.log("📱 No cached distances - showing location modal");
            setTimeout(() => {
                setShowLocationModal(true);
                setLoading(false);
            }, 500);
        }

        return () => clearInterval(intervalId);
    }, [dispatch, router]);

    const handleClicke = (name) => {
        const restaurant = restList.find(r => r.name === name);
        if (restaurant && restaurant.id) {
            const isActive = restaurantStatuses[restaurant.id];
            if (isActive !== undefined) {
                localStorage.setItem("currentRestaurantStatus", isActive);
            }
        }

        const dist = roadDistances[name] || "0";
        localStorage.setItem("currentRestaurantDistance", dist);
        localStorage.setItem("currentRestaurantName", name);

        if (name === "KNL") {
            router.push('/knlrest');
        } else if (name === "Snow Field") {
            router.push('/snowfield');
        } else if (name === "Kushas") {
            router.push('/kushas');
        } else if (name === "bros") {
            router.push('/bro');
        } else if (name === "mayuri") {
            router.push('/maurya');
        } else if (name === "Cake wala") {
            router.push('/sai');
        } else if (name === "Cream Stone") {
            router.push('/pv');
        }
    };

    if (loading && !mounted) return <Loading />;

    return (
        <div className="restaurant-list-page" style={{ paddingBottom: '100px' }}>

            {/* SIMPLE LOCATION MODAL */}
            <Modal show={showLocationModal} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <div className="mb-3">
                        <i className="fas fa-map-marker-alt fa-3x text-primary mb-3"></i>
                    </div>
                    <h5 className="fw-bold mb-3">Allow Location Access</h5>
                    <p className="text-muted small mb-4">
                        We need your location to show restaurant distances.
                        <br /><br />
                        <strong>Chrome will ask:</strong> "Allow this site to use your location?"
                    </p>
                    <button
                        className="btn btn-primary w-100 mb-3"
                        onClick={handleEnableLocation}
                    >
                        🔐 Allow Location
                    </button>
                    <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                            setShowLocationModal(false);
                            localStorage.setItem("locationSkipped", "true");
                        }}
                    >
                        Skip
                    </button>
                </Modal.Body>
            </Modal>

            {/* FETCHING MODAL */}
            <Modal show={showFetchingModal} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <div className="mt-3 fw-bold">Requesting Location...</div>
                    <div className="text-muted small mt-1">Chrome is asking for permission</div>
                </Modal.Body>
            </Modal>

            <Carousel interval={3000} className='coroselmain'>
                <Carousel.Item className='coroselmain2'>
                    <img className="d-block w-100" src="CA2.jpg" alt="Slide" />
                </Carousel.Item>
                <Carousel.Item className='coroselmain2'>
                    <img className="d-block w-100" src="CA1.jpg" alt="Slide" />
                </Carousel.Item>
                <Carousel.Item className='coroselmain2'>
                    <img className="d-block w-100" src="CA3.jpg" alt="Slide" />
                </Carousel.Item>
            </Carousel>

            <div style={{ padding: '20px' }}>
                <div className="filter-section mb-4">
                    <div className="search-input-group">
                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                        <input
                            type="text"
                            className="custom-search-input"
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="toggle-group d-flex align-items-center">
                        <button
                            className={`toggle-btn ${typeFilter === '' ? 'active-all' : ''}`}
                            onClick={() => setTypeFilter('')}
                            title="All"
                        >
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>All</span>
                        </button>

                        <button
                            className={`toggle-btn veg-btn ${typeFilter === 'veg' ? 'active-veg' : ''}`}
                            onClick={() => setTypeFilter('veg')}
                            title="Veg"
                        >
                            <i className="fa-solid fa-leaf"></i>
                        </button>

                        <button
                            className={`toggle-btn nonveg-btn ${typeFilter === 'non-veg' ? 'active-nonveg' : ''}`}
                            onClick={() => setTypeFilter('non-veg')}
                            title="Non-Veg"
                        >
                            <i className="fa-solid fa-drumstick-bite"></i>
                        </button>
                    </div>
                </div>

                <div className="mt-4">
                    {restList
                        .filter(restaurant => {
                            if (typeFilter && restaurant.type !== typeFilter) return false;
                            if (!search) return true;

                            const lowerSearch = search.toLowerCase();
                            if (restaurant.name.toLowerCase().includes(lowerSearch)) return true;

                            let startId = 0;
                            let endId = 0;

                            switch (restaurant.name) {
                                case "Kushas":
                                    startId = 1; endId = 4; break;
                                case "KNL":
                                    startId = 5; endId = 8; break;
                                case "Snow Field":
                                    startId = 9; endId = 12; break;
                                case "bros":
                                    startId = 13; endId = 16; break;
                                case "mayuri":
                                    startId = 17; endId = 20; break;
                                default:
                                    return false;
                            }

                            const hasMatchingItem = Data.some(item =>
                                item.id >= startId &&
                                item.id <= endId &&
                                item.name.toLowerCase().includes(lowerSearch)
                            );

                            return hasMatchingItem;
                        })
                        .map(item => (
                            <div key={item.name} className="mb-3">
                                <button onClick={() => handleClicke(item.name)} className="w-100 border-0 bg-transparent p-0">
                                    <RestorentDisplay
                                        name={item.name}
                                        place={item.place}
                                        image={item.image}
                                        rating={item.rating || "4.2"}
                                        distance={roadDistances[item.name] ? `${roadDistances[item.name]} km` : "..."}
                                        isActive={restaurantStatuses[item.id] !== false}
                                    />
                                </button>
                            </div>
                        ))
                    }
                </div>
            </div>
            <Navbar />
        </div>
    );
}