'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Carousel, Modal, Spinner } from 'react-bootstrap';

import './restorentList.css';
import { restList } from './restorentDtata';
import RestorentDisplay from './restorentDisplay';
import { useRouter } from "next/navigation";
import Navbar from '@/navigation/page';
import { isPointInPolygon } from "geolib";
import { getExactDistance } from '../actions/delivery';
import Loading from "../loading/page";

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

    // Kurnool polygon boundary
    /*
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
    */

    // Fetch distances function
    const fetchAllDistances = useCallback(async (uLat, uLng) => {
        /*
        console.log("🌐 Hitting Route API...");
        const results = {};
        await Promise.all(restList.map(async (item) => {
            try {
                const data = await getExactDistance(
                    { lat: parseFloat(uLat), lng: parseFloat(uLng) },
                    { lat: item.lat, lng: item.lng }
                );
                if (data && data.km) {
                    results[item.name] = data.km;
                }
            } catch (err) { console.error(err); }
        }));

        setRoadDistances(results);
        distRef.current = results;
        localStorage.setItem("allRestaurantDistances", JSON.stringify(results));
        sessionStorage.setItem("isAppLoaded", "true");
        */
    }, []);

    // Request location function
    const requestLocation = useCallback(() => {
        /*
        const isAppLoaded = sessionStorage.getItem("isAppLoaded");
        const savedDistances = localStorage.getItem("allRestaurantDistances");

        if (isAppLoaded === "true" && savedDistances) {
            console.log("📦 Using cached data.");
            const parsed = JSON.parse(savedDistances);
            setRoadDistances(parsed);
            distRef.current = parsed;
            setShowFetchingModal(false);
            return;
        }

        if (!navigator.geolocation) return;
        // Removed hasRequestedThisMount check here to allow manual retry if needed, 
        // or we can keep it if we are sure it's only called once per session logic.
        // But for "Enable Location" button click, we definitely want it to run even if useEffect called it.
        // Actually, the original logic had it. Let's keep it but reset it if needed? 
        // Better: rely on logic flow.

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                console.log("✅ Location obtained:", { latitude, longitude });

                // Check if user is inside the polygon
                const isInside = isPointInPolygon({ latitude, longitude }, kurnoolPolygon);

                if (!isInside) {
                    console.warn("🚫 User is outside the service area.");
                    setOutOfZone(true);
                    setShowFetchingModal(false);
                    setShowLocationModal(false);
                    return;
                }

                localStorage.setItem("customerLat", latitude);
                localStorage.setItem("customerLng", longitude);

                await fetchAllDistances(latitude, longitude);
                setShowFetchingModal(false);
                setShowLocationModal(false);
            },
            (err) => {
                console.error("🚫 Geolocation failed:", {
                    code: err.code,
                    message: err.message
                });

                let errorMessage = "⚠️ Location access failed. ";

                switch (err.code) {
                    case 1: // PERMISSION_DENIED
                        errorMessage += "📱 Permission denied. Check browser settings.";
                        // Check for insecure origin
                        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                            errorMessage = "⚠️ Geolocation requires HTTPS. It won't work on HTTP (Mobile/LAN).";
                        }
                        break;
                    case 2: // POSITION_UNAVAILABLE
                        errorMessage += "📶 GPS Signal weak or disabled.";
                        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                            errorMessage = "⚠️ Geolocation blocked on insecure network (HTTP). Use HTTPS or localhost.";
                        }
                        break;
                    case 3:
                        errorMessage += "⏰ Location timed out. Try outside.";
                        break;
                    default:
                        errorMessage += "Please try again";
                }

                setError(errorMessage);
                setLocationDenied(true);
                setShowFetchingModal(false);
                setShowLocationModal(false);
            },
            {
                enableHighAccuracy: true, // Forces "Turn on Location" on many Androids
                timeout: 45000,           // Increased timeout
                maximumAge: 0             // Do not use cached position
            }
        );
        */
    }, [fetchAllDistances]);

    // Enable location handler
    const handleEnableLocation = () => {
        /*
        setShowLocationModal(false);
        setShowFetchingModal(true);
        requestLocation();
        */
    };

    useEffect(() => {
        setMounted(true);

        const userId = localStorage.getItem("userId");
        if (!userId) {
            router.replace("/login");
        } else {
            setLoading(false);

            /*
            const isAppLoaded = sessionStorage.getItem("isAppLoaded");
            if (isAppLoaded !== "true") {
                setShowLocationModal(true);
            } else {
                requestLocation();
            }
            */
        }
    }, [router, requestLocation]);

    const proceedToRoute = (name, distance) => {
        setIsRouting(true);
        setTimeout(() => setIsRouting(false), 2000);
    };

    const handleClick = (name) => {
        // Using hardcoded distance since location is disabled - MODIFIED
        const currentDistance = "0.0"; // distRef.current[name] || "0.0";
        proceedToRoute(name, currentDistance);
    };

    const handleClicke = (name) => {
        const dist = roadDistances[name] || "0";
        localStorage.setItem("currentRestaurantDistance", dist);
        localStorage.setItem("currentRestaurantName", name);

        if (name === "KNL") {
            window.location.href = './knlrest';
        } else if (name === "Snow Field") {
            window.location.href = './snowfield';
        } else if (name === "Kushas") {
            window.location.href = './kushas';
        } else if (name === "bros") {
            window.location.href = './bro';
        } else if (name === "mayuri") {
            window.location.href = './maurya';
        }
    };

    if (!mounted || loading) return <Loading />;

    return (
        <div className="restaurant-list-page" style={{ paddingBottom: '80px' }}>

            {/* Location Modal */}
            {/* 
            <Modal show={showLocationModal} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <div className="mb-3">
                        <i className="fas fa-map-marker-alt fa-3x text-primary mb-3"></i>
                    </div>
                    <h5 className="fw-bold mb-3">Enable Location Access</h5>
                    <p className="text-muted small mb-4">
                        Turn on your location to find nearby restaurants in Kurnool
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
                            setLocationDenied(true);
                            sessionStorage.setItem("isAppLoaded", "true");
                        }}
                    >
                        Skip for now
                    </button>
                </Modal.Body>
            </Modal>
             */}

            {/* Fetching Modal */}
            {/* 
            <Modal show={showFetchingModal} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <div className="mt-3 fw-bold">Fetching Location...</div>
                    <div className="text-muted small mt-1">Please wait</div>
                </Modal.Body>
            </Modal>
             */}

            {/* Location Denied Modal */}
            {/* 
            <Modal show={locationDenied && Object.keys(roadDistances).length === 0} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <i className="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i>
                    <h6 className="fw-bold mb-3">Location Access</h6>
                    <p className="text-muted small mb-4">{error || "Please enable location for best experience"}</p>
                    <button className="btn btn-primary w-100" onClick={handleEnableLocation}>
                        📱 Try GPS Again
                    </button>
                </Modal.Body>
            </Modal>
             */}

            {/* Out of Zone Modal */}
            {/* 
            <Modal show={outOfZone} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <i className="fas fa-map-marked-alt fa-3x text-danger mb-3"></i>
                    <h5 className="fw-bold mb-3">Service Unavailable</h5>
                    <p className="text-muted small mb-4">
                        Sorry, we do not deliver to your current location yet.
                    </p>
                    <button
                        className="btn btn-primary w-100"
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        🔄 Check Again
                    </button>
                </Modal.Body>
            </Modal>
             */}

            {/* 
            <Modal show={isCalculating} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <Spinner animation="border" variant="primary" size="sm" />
                    <div className="mt-3 fw-bold">Calculating Distance...</div>
                </Modal.Body>
            </Modal>
             */}

            {/* 
            <Modal show={isRouting} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <Spinner animation="grow" variant="success" size="sm" />
                    <div className="mt-2 fw-bold text-muted small">Entering Restaurant...</div>
                </Modal.Body>
            </Modal>
             */}

            <Carousel interval={3000} className='coroselmain'>
                <Carousel.Item className='coroselmain2'>
                    <img className="d-block w-100" src="https://img.etimg.com/thumb/msid-106775052,width-300,height-225,imgsize-69266,resizemode-75/mclaren-750s-launched-in-india-at-rs-5-91-crore-what-makes-it-so-expensive.jpg" alt="Slide" />
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
                        .filter(item => (item.name.toLowerCase().includes(search.toLowerCase()) && (typeFilter === '' || item.type === typeFilter)))
                        .map(item => (
                            <div key={item.name} className="mb-3">
                                <button onClick={() => handleClicke(item.name)} className="w-100 border-0 bg-transparent p-0">
                                    <RestorentDisplay
                                        name={item.name}
                                        place={item.place}
                                        image={item.image}
                                        rating={item.rating || "4.2"}
                                        distance={roadDistances[item.name] ? `${roadDistances[item.name]} km` : "..."}
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