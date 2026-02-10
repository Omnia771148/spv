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

    // Request location function - SIMPLIFIED
    const requestLocation = useCallback((force = false) => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLocationDenied(true);
            return;
        }
        
        if (!force && hasRequestedThisMount.current) return;
        hasRequestedThisMount.current = true;

        setShowFetchingModal(true);
        
        // DIRECT CALL to getCurrentPosition - This will trigger Chrome's permission prompt
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                console.log("✅ Location obtained:", { latitude, longitude });
                localStorage.setItem("customerLat", latitude);
                localStorage.setItem("customerLng", longitude);
                sessionStorage.removeItem("locationSkipped");

                // Check if user is inside the polygon
                const isInside = isPointInPolygon({ latitude, longitude }, kurnoolPolygon);

                if (isInside) {
                    localStorage.setItem("isServiceAvailable", "true");
                    await fetchAllDistances(latitude, longitude);
                } else {
                    console.warn("🚫 User is outside the service area.");
                    localStorage.setItem("isServiceAvailable", "false");
                    setOutOfZone(true);
                    setError("❌ Outside Service Area");
                }
                setShowFetchingModal(false);
                setShowLocationModal(false);
            },
            (err) => {
                let errorMsg = "⚠️ GPS access required.";

                switch (err.code) {
                    case 1: // PERMISSION_DENIED
                        errorMsg = "❌ Location permission denied. Please allow site access in browser settings.";
                        break;
                    case 2: // POSITION_UNAVAILABLE
                        errorMsg = "⚠️ Location unavailable. Please turn on your Device Location/GPS.";
                        break;
                    case 3: // TIMEOUT
                        errorMsg = "⚠️ Location request timed out. Please retry.";
                        break;
                    default:
                        errorMsg = "⚠️ GPS access failed: " + (err.message || "Unknown error");
                }

                const userId = localStorage.getItem("userId");
                if (userId) {
                    fetch(`/api/check-user-active-order?userId=${userId}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.hasActiveOrder) {
                                console.log("📦 Active Order Found: Skipping location requirement.");
                                setShowFetchingModal(false);
                                setShowLocationModal(false);
                                return;
                            }

                            if (sessionStorage.getItem("locationSkipped") === "true") return;

                            console.error("🚫 Geolocation failed:", err);

                            if (err.code === 1) {
                                setLocationDenied(true);
                                setShowLocationModal(false);
                                setError(errorMsg);
                            } else {
                                setLocationDenied(false);
                                setShowLocationModal(true);
                            }
                            setShowFetchingModal(false);

                            // CLEAR OLD LOCATION DATA
                            localStorage.removeItem("allRestaurantDistances");
                            localStorage.removeItem("customerLat");
                            localStorage.removeItem("customerLng");
                            localStorage.removeItem("currentRestaurantDistance");
                            localStorage.removeItem("currentRestaurantName");
                            setRoadDistances({});
                            distRef.current = {};
                        })
                        .catch(() => {
                            console.error("🚫 Geolocation failed (Check Error):", err);
                            if (err.code === 1) {
                                setLocationDenied(true);
                                setShowLocationModal(false);
                                setError(errorMsg);
                            } else {
                                setLocationDenied(false);
                                setShowLocationModal(true);
                            }
                            setShowFetchingModal(false);

                            // CLEAR OLD LOCATION DATA
                            localStorage.removeItem("allRestaurantDistances");
                            localStorage.removeItem("customerLat");
                            localStorage.removeItem("customerLng");
                            localStorage.removeItem("currentRestaurantDistance");
                            localStorage.removeItem("currentRestaurantName");
                            setRoadDistances({});
                            distRef.current = {};
                        });
                } else {
                    console.error("🚫 Geolocation failed (No Active Order):", err);

                    if (err.code === 1) {
                        setLocationDenied(true);
                        setShowLocationModal(false);
                        setError(errorMsg);
                    } else {
                        setLocationDenied(false);
                        setShowLocationModal(true);
                    }
                    setShowFetchingModal(false);

                    // CLEAR OLD LOCATION DATA
                    localStorage.removeItem("allRestaurantDistances");
                    localStorage.removeItem("customerLat");
                    localStorage.removeItem("customerLng");
                    localStorage.removeItem("currentRestaurantDistance");
                    localStorage.removeItem("currentRestaurantName");
                    setRoadDistances({});
                    distRef.current = {};
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            }
        );
    }, [fetchAllDistances]);

    // Enable location handler
    const handleEnableLocation = () => {
        setShowLocationModal(false);
        requestLocation(true);
    };

    const dispatch = useDispatch();
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

        const checkActiveAndProceed = async () => {
            // Check if location was previously skipped
            if (sessionStorage.getItem("locationSkipped") === "true") {
                console.log("⏭️ Location skipped by user.");
                setShowLocationModal(false);
                return;
            }

            // Check for Active Orders FIRST
            if (userId) {
                try {
                    const res = await fetch(`/api/check-user-active-order?userId=${userId}`);
                    const data = await res.json();
                    if (data.hasActiveOrder) {
                        console.log("🛑 Active Order Exists: Skipping ALL location APIS.");
                        setShowLocationModal(false);
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

            // SHOW MODAL FIRST, then user will click to trigger Chrome's permission prompt
            setShowLocationModal(true);
        };

        checkActiveAndProceed();
        setLoading(false);

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

            {/* Location Modal */}
            <Modal show={showLocationModal} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <div className="mb-3">
                        <i className="fas fa-map-marker-alt fa-3x text-primary mb-3"></i>
                    </div>
                    <h5 className="fw-bold mb-3">Enable Location Access</h5>
                    <p className="text-muted small mb-4">
                        Turn on your location to find nearby restaurants in Kurnool
                        <br /><br />
                        <strong>Chrome will ask:</strong> "Allow this site to use your location?"
                        <br />
                        Click <strong>Allow</strong> to continue.
                    </p>
                    <button
                        className="btn btn-primary w-100 mb-2"
                        onClick={handleEnableLocation}
                    >
                        🔐 Turn On Location
                    </button>
                    <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                            setShowLocationModal(false);
                            setShowFetchingModal(false);
                            setLocationDenied(false);
                            setOutOfZone(false);

                            sessionStorage.setItem("isAppLoaded", "true");
                            sessionStorage.setItem("locationSkipped", "true");

                            localStorage.removeItem("allRestaurantDistances");
                            localStorage.removeItem("customerLat");
                            localStorage.removeItem("customerLng");
                            localStorage.removeItem("currentRestaurantDistance");
                            localStorage.removeItem("currentRestaurantName");

                            setRoadDistances({});
                            distRef.current = {};
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
                    <div className="mt-3 fw-bold">Fetching Location...</div>
                    <div className="text-muted small mt-1">Please wait</div>
                </Modal.Body>
            </Modal>

            {/* Location Denied / Error Modal */}
            <Modal show={locationDenied && Object.keys(roadDistances).length === 0} onHide={() => setLocationDenied(false)} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <i className="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i>
                    <h6 className="fw-bold mb-3">Location Access Needed</h6>
                    <p className="text-muted small mb-4">{error || "Please enable location in your browser settings to continue."}</p>

                    <button className="btn btn-primary w-100 mb-2" onClick={handleEnableLocation}>
                        📱 Retry GPS
                    </button>
                    <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => setLocationDenied(false)}
                    >
                        Dismiss
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
        </div >
    );
}