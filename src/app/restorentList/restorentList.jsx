'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Carousel, Modal, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurantStatuses, fetchItemStatuses, selectAllStatuses } from 'lib/features/restaurantSlice';

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
    const [isListening, setIsListening] = useState(false);
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

    // IMMEDIATE: Load cached distances on mount to prevent "..." flash
    useEffect(() => {
        const saved = localStorage.getItem("allRestaurantDistances");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setRoadDistances(parsed);
                distRef.current = parsed;
            } catch (e) {
                console.error("Failed to load initial cache", e);
            }
        }
    }, []);

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

    // Request location function
    const requestLocation = useCallback((force = false) => {
        // Cache check removed to allow re-verification of location on startup
        // This ensures the browser permission prompt handles the allow/block logic


        if (!navigator.geolocation) return;
        if (!force && hasRequestedThisMount.current) return;
        hasRequestedThisMount.current = true;

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                console.log("✅ Location obtained:", { latitude, longitude });
                localStorage.setItem("customerLat", latitude);
                localStorage.setItem("customerLng", longitude);
                sessionStorage.removeItem("locationSkipped"); // Clear skipped flag on success

                // Only show blocking modal if this is the first load of the session
                const isAppLoaded = sessionStorage.getItem("isAppLoaded");
                if (!isAppLoaded) {
                    setShowFetchingModal(true);
                }
                setShowLocationModal(false);

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

                if (!isAppLoaded) {
                    setShowFetchingModal(false);
                }
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
                    // Check if user has active orders before forcing location
                    fetch(`/api/check-user-active-order?userId=${userId}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.hasActiveOrder) {
                                console.log("📦 Active Order Found: Skipping location requirement.");
                                setShowFetchingModal(false);
                                setShowLocationModal(false);
                                return;
                            }

                            // Otherwise show error
                            console.error("🚫 Geolocation failed:", err);

                            // If explicit denial, show error. If just unavailable/timeout (likely GPS off), show friendly modal to retry with gesture.
                            if (err.code === 1) { // PERMISSION_DENIED
                                setLocationDenied(true);
                                setShowLocationModal(false);
                                setError(errorMsg);
                            } else {
                                // POSITION_UNAVAILABLE (2) or TIMEOUT (3) -> Likely GPS off or weird state
                                // Show friendly modal to force a user gesture which helps trigger the native prompt
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
                            // Fallback on error (Network issue etc)
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
                        // For GPS off/Timeout, reopen the main modal so clicking "Turn On" acts as the gesture
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

    // Enable location handler - DIRECT CALL to bypass any state/ref logic
    const handleEnableLocation = () => {
        // Reset all error states so we can try again cleanly
        setLocationDenied(false);
        setOutOfZone(false);
        setError(null);
        setShowLocationModal(false);
        setShowFetchingModal(true);

        // Directly call requestLocation with force=true
        requestLocation(true);
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

        // Location Logic: Aggressively prefer cached data
        const savedDistances = localStorage.getItem("allRestaurantDistances");
        const userId = localStorage.getItem("userId");
        // const isAppLoaded = sessionStorage.getItem("isAppLoaded"); // Removed to force check on reload

        const checkActiveAndProceed = async () => {
            // 1. Load cached distances FIRST so user sees data immediately while we refresh location
            if (savedDistances) {
                try {
                    const parsed = JSON.parse(savedDistances);
                    console.log("💾 Loading distances from cache for immediate display:", parsed);
                    setRoadDistances(parsed);
                    distRef.current = parsed;
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }

            // 2. Request Location Logic
            // If app is already loaded in this session, DO NOT request location again.
            // This prevents asking for permission or recalculating distances on simple route changes.
            const isAppLoaded = sessionStorage.getItem("isAppLoaded");
            if (isAppLoaded) {
                console.log("⚡ App cached in session: Skipping location request.");
                return;
            }

            // 3. Check for Active Orders BEFORE Requesting Location (API Cost Optimization)
            if (userId) {
                try {
                    const res = await fetch(`/api/check-user-active-order?userId=${userId}`);
                    const data = await res.json();
                    if (data.hasActiveOrder) {
                        console.log("📦 Active Order Found: Skipping Google Route API & Location check.");
                        sessionStorage.setItem("isAppLoaded", "true"); // Mark as loaded so we don't check again
                        return; // EXIT COMPLETELY - Save Money!
                    }
                } catch (err) {
                    console.error("Failed to check active order", err);
                    // Fall through to request location if check fails
                }
            }

            // 4. First time in session & No Active Order: Request Location
            requestLocation();
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
            <Modal show={showLocationModal} centered backdrop="static" keyboard={false} size="sm" contentClassName="location-modal-content">
                <Modal.Body className="text-center py-4">
                    <div className="location-modal-icon-container">
                        <i className="fas fa-map-marker-alt location-modal-icon"></i>
                    </div>
                    <h5 className="location-modal-title">Enable Location Access</h5>
                    <p className="location-modal-text">
                        Turn on your location to enter the app. We only serve in Kurnool.
                    </p>
                    <button
                        className="location-modal-btn primary-btn"
                        onClick={handleEnableLocation}
                    >
                        🔐 Turn On Location
                    </button>
                    {/* Skip button removed - Location is mandatory */}
                </Modal.Body>
            </Modal>

            {/* Fetching Modal */}
            <Modal show={showFetchingModal} centered backdrop="static" keyboard={false} size="sm" contentClassName="location-modal-content">
                <Modal.Body className="text-center py-4">
                    <div className="location-loader">
                        <Spinner animation="border" />
                    </div>
                    <div className="location-modal-title mt-3">Fetching Location...</div>
                    <div className="location-modal-text">Checking if you are in Kurnool</div>
                </Modal.Body>
            </Modal>

            {/* Location Denied / Error Modal */}
            <Modal show={locationDenied && Object.keys(roadDistances).length === 0} centered backdrop="static" keyboard={false} size="sm" contentClassName="location-modal-content">
                <Modal.Body className="text-center py-4">
                    <div className="location-modal-icon-container warning">
                        <i className="fas fa-exclamation-triangle location-modal-icon"></i>
                    </div>
                    <h6 className="location-modal-title">Location Access Required</h6>
                    <p className="location-modal-text">{error || "You must enable location and be in Kurnool to use this app."}</p>

                    <button className="location-modal-btn primary-btn" onClick={handleEnableLocation}>
                        📱 Retry GPS
                    </button>
                    {/* Dismiss button removed */}
                </Modal.Body>
            </Modal>

            {/* Out of Zone Modal */}
            <Modal show={outOfZone} centered backdrop="static" keyboard={false} size="sm" contentClassName="location-modal-content">
                <Modal.Body className="text-center py-4">
                    <div className="location-modal-icon-container danger">
                        <i className="fas fa-map-marked-alt location-modal-icon"></i>
                    </div>
                    <h5 className="location-modal-title">Service Unavailable</h5>
                    <p className="location-modal-text">
                        Sorry, we are currently only operational in <b>Kurnool</b>.<br />
                        You are outside our service area.
                    </p>
                    <button
                        className="location-modal-btn danger-btn"
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        🔄 Check Location Again
                    </button>
                    {/* Browse Anyway button removed */}
                </Modal.Body>
            </Modal>

            <Modal show={isCalculating} centered backdrop="static" size="sm" contentClassName="location-modal-content">
                <Modal.Body className="text-center py-4">
                    <div className="location-loader">
                        <Spinner animation="border" />
                    </div>
                    <div className="location-modal-title mt-3">Calculating Distance...</div>
                </Modal.Body>
            </Modal>

            <Modal show={isRouting} centered backdrop="static" size="sm" contentClassName="location-modal-content">
                <Modal.Body className="text-center py-4">
                    <div className="location-loader">
                        <Spinner animation="grow" variant="success" />
                    </div>
                    <div className="location-modal-title mt-2">Entering Restaurant...</div>
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
                        <i
                            className={`fa-solid fa-microphone search-icon ${isListening ? 'text-danger' : ''}`}
                            onClick={() => {
                                const runSpeechRecog = () => {
                                    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                                        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                                        const recognition = new SpeechRecognition();
                                        recognition.lang = 'en-US';
                                        recognition.interimResults = false;
                                        recognition.maxAlternatives = 1;

                                        recognition.onstart = () => {
                                            setIsListening(true);
                                            setSearch('');
                                        };

                                        recognition.onresult = (event) => {
                                            const transcript = event.results[0][0].transcript;
                                            setSearch(transcript);
                                            setIsListening(false);
                                        };

                                        recognition.onerror = (event) => {
                                            console.error("Speech recognition error", event.error);
                                            setIsListening(false);
                                            if (event.error === 'not-allowed') {
                                                alert("Microphone access denied. Please check your browser settings.");
                                            }
                                        };

                                        recognition.onend = () => {
                                            setIsListening(false);
                                        };

                                        recognition.start();
                                    } else {
                                        alert("Voice search is not supported in this browser.");
                                    }
                                };

                                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                                    navigator.mediaDevices.getUserMedia({ audio: true })
                                        .then(function (stream) {
                                            stream.getTracks().forEach(track => track.stop());
                                            runSpeechRecog();
                                        })
                                        .catch(function (err) {
                                            console.error("Error accessing microphone:", err);
                                            runSpeechRecog();
                                        });
                                } else {
                                    runSpeechRecog();
                                }
                            }}
                            style={{ cursor: 'pointer', marginLeft: '10px', color: isListening ? 'red' : 'inherit' }}
                        ></i>
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
                                        isActive={restaurantStatuses[item.id] !== false} // Default to true if undefined to avoid flashing closed on load, or handle loading state
                                    />
                                </button>
                            </div>
                        ))
                    }
                </div>
            </div>
            {/* Navbar Removed: Already handled in global layout */}
            <Navbar />
        </div >
    );
}