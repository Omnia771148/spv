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
import { isPointInPolygon, getDistance } from "geolib";
import { getExactDistance } from '../actions/delivery';
import Loading from "../loading/page";
import { showToast } from '../../toaster/page';

// Kurnool polygon boundary
const kurnoolPolygon = [
    { latitude: 15.845928, longitude: 78.012744 },
    { latitude: 15.846311, longitude: 78.019729 },
    { latitude: 15.839716, longitude: 78.027036 },
    { latitude: 15.846872, longitude: 78.031149 },
    { latitude: 15.84623, longitude: 78.034459 },
    { latitude: 15.838115, longitude: 78.049654 },
    { latitude: 15.82565, longitude: 78.056682 },
    { latitude: 15.818905, longitude: 78.060495 },
    { latitude: 15.815102, longitude: 78.065114 },
    { latitude: 15.801613, longitude: 78.072318 },
    { latitude: 15.798335, longitude: 78.078557 },
    { latitude: 15.79411, longitude: 78.078435 },
    { latitude: 15.786917, longitude: 78.078888 },
    { latitude: 15.776939, longitude: 78.073002 },
    { latitude: 15.772624, longitude: 78.057852 },
    { latitude: 15.768974, longitude: 78.054399 },
    { latitude: 15.765935, longitude: 78.049634 },
    { latitude: 15.77651, longitude: 78.02883 },
    { latitude: 15.813778, longitude: 77.996924 },
    { latitude: 15.847026, longitude: 78.005964 }
];

export default function RestorentList() {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState(null);
    const [isRouting, setIsRouting] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    // Location modal states
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showFetchingModal, setShowFetchingModal] = useState(false);
    const [locationDenied, setLocationDenied] = useState(false);
    const [outOfZone, setOutOfZone] = useState(false);

    // Location distance states
    const [roadDistances, setRoadDistances] = useState({});
    const distRef = useRef({});

    const router = useRouter();

    // Location request tracking
    const hasRequestedThisMount = useRef(false);

    // Fetch distances function
    const fetchAllDistances = useCallback(async (uLat, uLng) => {
        console.log("🌐 New Application Instance: Hitting Route API...");
        const results = {};
        await Promise.all(restList.map(async (item) => {
            try {
                const data = await getExactDistance(
                    { lat: parseFloat(uLat), lng: parseFloat(uLng) },
                    { lat: item.lat, lng: item.lng }
                );
                if (data && data.km) {
                    results[item.name] = data.km;
                } else {
                    // Fallback to air distance if API fails
                    console.warn(`⚠️ Falling back to air distance for ${item.name}`);
                    const distMeters = getDistance(
                        { latitude: parseFloat(uLat), longitude: parseFloat(uLng) },
                        { latitude: item.lat, longitude: item.lng }
                    );
                    results[item.name] = (distMeters / 1000).toFixed(1);
                }
            } catch (err) {
                console.error(err);
                // Fallback on error
                const distMeters = getDistance(
                    { latitude: parseFloat(uLat), longitude: parseFloat(uLng) },
                    { latitude: item.lat, longitude: item.lng }
                );
                results[item.name] = (distMeters / 1000).toFixed(1);
            }
        }));

        setRoadDistances(results);
        distRef.current = results;
        localStorage.setItem("allRestaurantDistances", JSON.stringify(results));
        sessionStorage.setItem("isAppLoaded", "true");
    }, []);

    // SIMPLE LOCATION REQUEST FUNCTION - This WILL trigger Chrome's dialog
    const triggerChromeLocationPrompt = useCallback(() => {
        console.log("🎯 Triggering Chrome's location permission dialog...");
        
        // Clear any previous permission state
        sessionStorage.removeItem("locationSkipped");
        hasRequestedThisMount.current = false;
        
        // Show fetching modal
        setShowFetchingModal(true);
        setShowLocationModal(false);
        
        // DIRECT CALL to getCurrentPosition - This triggers Chrome's permission dialog
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                console.log("✅ Chrome permission GRANTED, location obtained");
                const { latitude, longitude } = pos.coords;
                
                localStorage.setItem("customerLat", latitude);
                localStorage.setItem("customerLng", longitude);
                
                // Check if user is inside the polygon
                const isInside = isPointInPolygon({ latitude, longitude }, kurnoolPolygon);
                console.log("📍 Inside polygon:", isInside);

                if (isInside) {
                    localStorage.setItem("isServiceAvailable", "true");
                    await fetchAllDistances(latitude, longitude);
                    console.log("📊 Distances calculated successfully");
                } else {
                    console.warn("🚫 User is outside the service area.");
                    localStorage.setItem("isServiceAvailable", "false");
                    setOutOfZone(true);
                    setError("❌ Outside Service Area");
                }
                setShowFetchingModal(false);
            },
            (err) => {
                console.log("❌ Chrome permission result:", err);
                setShowFetchingModal(false);
                
                if (err.code === 1) {
                    // PERMISSION_DENIED - Chrome's "Block" was clicked
                    console.log("🚫 User clicked BLOCK in Chrome dialog");
                    setLocationDenied(true);
                    setError("Location permission denied. Please allow in Chrome settings.");
                } else if (err.code === 2 || err.code === 3) {
                    // POSITION_UNAVAILABLE or TIMEOUT - GPS might be off
                    console.log("⚠️ GPS/Location service unavailable");
                    setLocationDenied(true);
                    setError("Unable to get location. Please ensure GPS/Location is turned on.");
                }
                
                // Clear old data
                localStorage.removeItem("allRestaurantDistances");
                localStorage.removeItem("customerLat");
                localStorage.removeItem("customerLng");
                setRoadDistances({});
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    }, [fetchAllDistances]);

    // Enable location handler - This button triggers Chrome's dialog
    const handleEnableLocation = () => {
        console.log("🖱️ User clicked 'Turn On Location'");
        triggerChromeLocationPrompt();
    };

    const dispatch = useDispatch();
    // Get statuses from Redux store
    const restaurantStatuses = useSelector(selectAllStatuses);

    useEffect(() => {
        setMounted(true);

        // Redux Auth Check
        if (!localStorage.getItem("userId")) {
            router.replace("/login");
            return;
        }

        // Fetch restaurant statuses via Redux
        dispatch(fetchRestaurantStatuses());
        dispatch(fetchItemStatuses());

        // Auto-refresh status
        const intervalId = setInterval(() => {
            console.log("🔄 Auto-refreshing restaurant data...");
            dispatch(fetchRestaurantStatuses());
            dispatch(fetchItemStatuses());
        }, 20000);

        // Location Logic
        const savedDistances = localStorage.getItem("allRestaurantDistances");
        const userId = localStorage.getItem("userId");
        const isAppLoaded = sessionStorage.getItem("isAppLoaded");

        const checkActiveAndProceed = async () => {
            // 1. App Loaded Check - if app already loaded, use cached data
            if (isAppLoaded === "true") {
                console.log("✅ App already loaded, using cached location data");
                if (savedDistances) {
                    try {
                        const parsed = JSON.parse(savedDistances);
                        setRoadDistances(parsed);
                        distRef.current = parsed;
                    } catch (e) { console.error("Cache load error", e) }
                }
                setShowLocationModal(false);
                return;
            }

            // Check if location was previously skipped
            if (sessionStorage.getItem("locationSkipped") === "true") {
                console.log("⏭️ Location skipped by user.");
                setShowLocationModal(false);
                return;
            }

            // 2. Check for Active Orders FIRST - ALWAYS RUN THIS
            if (userId) {
                try {
                    const res = await fetch(`/api/check-user-active-order?userId=${userId}`);
                    const data = await res.json();
                    if (data.hasActiveOrder) {
                        console.log("🛑 Active Order Exists: Skipping ALL location APIS.");
                        setShowLocationModal(false);
                        // If active order exists, use cache
                        if (savedDistances) {
                            try {
                                const parsed = JSON.parse(savedDistances);
                                setRoadDistances(parsed);
                                distRef.current = parsed;
                            } catch (e) { console.error("Active order cache load error", e) }
                        }
                        sessionStorage.setItem("isAppLoaded", "true");
                        return;
                    }
                } catch (err) {
                    console.error("Failed to check active order", err);
                }
            }

            // 3. Show modal to user FIRST
            console.log("📱 Showing location request modal to user");
            setShowLocationModal(true);
        };

        checkActiveAndProceed();
        setLoading(false);

        return () => clearInterval(intervalId);
    }, [dispatch, router]);


    const proceedToRoute = (name, distance) => {
        setIsRouting(true);
        setTimeout(() => setIsRouting(false), 2000);
    };

    const handleClicke = (name) => {
        // Find the restaurant to get its ID
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

            {/* Location Modal */}
            <Modal show={showLocationModal} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <div className="mb-3">
                        <i className="fas fa-map-marker-alt fa-3x text-primary mb-3"></i>
                    </div>
                    <h5 className="fw-bold mb-3">Enable Location Access</h5>
                    <p className="text-muted small mb-4">
                        <strong>Chrome will ask:</strong> "Allow this site to use your location?"
                        <br /><br />
                        Click <strong>Allow</strong> to see restaurant distances near you.
                    </p>
                    <button
                        className="btn btn-primary w-100 mb-2"
                        onClick={handleEnableLocation}
                    >
                        🔐 Allow Location Access
                    </button>
                    <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                            // Skip location
                            setShowLocationModal(false);
                            sessionStorage.setItem("isAppLoaded", "true");
                            sessionStorage.setItem("locationSkipped", "true");
                            localStorage.removeItem("allRestaurantDistances");
                            localStorage.removeItem("customerLat");
                            localStorage.removeItem("customerLng");
                            setRoadDistances({});
                        }}
                    >
                        Skip for now
                    </button>
                </Modal.Body>
            </Modal>

            {/* Fetching Modal */}
            <Modal show={showFetchingModal} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <div className="mt-3 fw-bold">Waiting for Chrome Permission...</div>
                    <div className="text-muted small mt-1">Chrome is asking for location access</div>
                </Modal.Body>
            </Modal>

            {/* Location Denied / Error Modal */}
            <Modal show={locationDenied} onHide={() => setLocationDenied(false)} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <i className="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i>
                    <h6 className="fw-bold mb-3">Location Access Needed</h6>
                    <p className="text-muted small mb-4">
                        {error || "Please allow location access in Chrome to see restaurant distances."}
                    </p>
                    <button className="btn btn-primary w-100 mb-2" onClick={handleEnableLocation}>
                        🔄 Try Again
                    </button>
                    <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => setLocationDenied(false)}
                    >
                        Browse Without Location
                    </button>
                </Modal.Body>
            </Modal>

            {/* Out of Zone Modal */}
            <Modal show={outOfZone} onHide={() => setOutOfZone(false)} centered backdrop={true} size="sm">
                <Modal.Body className="text-center py-4">
                    <i className="fas fa-map-marked-alt fa-3x text-danger mb-3"></i>
                    <h5 className="fw-bold mb-3">Service Unavailable</h5>
                    <p className="text-muted small mb-4">
                        We do not deliver to your current location yet.<br />
                        You can still browse the menu.
                    </p>
                    <button
                        className="btn btn-primary w-100 mb-2"
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        🔄 Check Location Again
                    </button>
                    <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => setOutOfZone(false)}
                    >
                        Browse Anyway
                    </button>
                </Modal.Body>
            </Modal>

            <Modal show={isCalculating} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <Spinner animation="border" variant="primary" size="sm" />
                    <div className="mt-3 fw-bold">Calculating Distance...</div>
                </Modal.Body>
            </Modal>

            <Modal show={isRouting} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <Spinner animation="grow" variant="success" size="sm" />
                    <div className="mt-2 fw-bold text-muted small">Entering Restaurant...</div>
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
                {/* Search and Filter Section */}
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

                <div className="mt-4">
                    {restList
                        .filter(restaurant => {
                            // 1. Type Filter
                            if (typeFilter && restaurant.type !== typeFilter) return false;

                            // 2. Search Filter
                            if (!search) return true;

                            const lowerSearch = search.toLowerCase();

                            // Check Restaurant Name
                            if (restaurant.name.toLowerCase().includes(lowerSearch)) return true;

                            // Check Items in Restaurant
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
        </div >
    );
}