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
import Loading from "../loading/page"; // Added import

export default function RestorentList() {
    const [loading, setLoading] = useState(true); // Added loading state
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState(null);
    const [isRouting, setIsRouting] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showFetchingModal, setShowFetchingModal] = useState(false);
    const [locationDenied, setLocationDenied] = useState(false);

    const [roadDistances, setRoadDistances] = useState({});
    const distRef = useRef({});

    const router = useRouter();
    const hasRequestedThisMount = useRef(false);

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
                }
            } catch (err) { console.error(err); }
        }));

        setRoadDistances(results);
        distRef.current = results;
        localStorage.setItem("allRestaurantDistances", JSON.stringify(results));
        sessionStorage.setItem("isAppLoaded", "true");
    }, []);

    const requestLocation = useCallback(() => {
        const isAppLoaded = sessionStorage.getItem("isAppLoaded");
        const savedDistances = localStorage.getItem("allRestaurantDistances");

        if (isAppLoaded === "true" && savedDistances) {
            console.log("📦 Route Change Detected: Using cached data.");
            const parsed = JSON.parse(savedDistances);
            setRoadDistances(parsed);
            distRef.current = parsed;
            setShowFetchingModal(false);
            return;
        }

        if (!navigator.geolocation || hasRequestedThisMount.current) return;
        hasRequestedThisMount.current = true;

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                localStorage.setItem("customerLat", latitude);
                localStorage.setItem("customerLng", longitude);

                if (isPointInPolygon({ latitude, longitude }, kurnoolPolygon)) {
                    await fetchAllDistances(latitude, longitude);
                } else {
                    setError("❌ Outside Service Area");
                }
                setShowFetchingModal(false);
                setShowLocationModal(false);
            },
            (err) => {
                console.error("Location error:", err);
                setLocationDenied(true);
                setShowFetchingModal(false);
                setShowLocationModal(false);
                setError("⚠️ GPS access required.");
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [fetchAllDistances]);

    const handleEnableLocation = () => {
        setShowLocationModal(false);
        setShowFetchingModal(true);
        requestLocation();
    };

    useEffect(() => {
        setMounted(true);
        /*
        const isAppLoaded = sessionStorage.getItem("isAppLoaded");
        const savedDistances = localStorage.getItem("allRestaurantDistances");

        if (isAppLoaded === "true") {
            if (savedDistances) {
                const parsed = JSON.parse(savedDistances);
                setRoadDistances(parsed);
                distRef.current = parsed;
            }
            setShowLocationModal(false);
        } else {
            setShowLocationModal(true);
        }
        */
        setLoading(false);
    }, []);

    const proceedToRoute = (name, distance) => {
        setIsRouting(true);
        setTimeout(() => setIsRouting(false), 2000);
    };

    const handleClick = (name) => {
        const currentDistance = distRef.current[name] || "0.0";
        proceedToRoute(name, currentDistance);
    };

    const handleClicke = (name) => {
        if (name === "KNL") {
            window.location.href = './knlrest';
        } else if (name === "Snow Field") {
            window.location.href = './snowfield';
        } else if (name === "Kushas") {
            window.location.href = './kushas';
        } else if (name === "Bros story") {
            window.location.href = './Browsstory';
        } else {
            window.location.href = './lanjesh';
        }
    };

    if (!mounted || loading) return <Loading />;

    return (
        <div style={{ paddingBottom: '80px' }}>
            {/* <Modal show={showLocationModal} centered backdrop="static" size="sm">
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
                            sessionStorage.setItem("isAppLoaded", "true"); // Ensures it skips for this session
                        }}
                    >
                        Skip for now
                    </button>
                </Modal.Body>
            </Modal> */}

            {/* Fetching Location Modal */}
            {/* <Modal show={showFetchingModal} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <div className="mt-3 fw-bold">Fetching Location...</div>
                    <div className="text-muted small mt-1">Please wait</div>
                </Modal.Body>
            </Modal> */}

            {/* Location Denied Modal */}
            {/* <Modal show={locationDenied && Object.keys(roadDistances).length === 0} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <i className="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i>
                    <h6 className="fw-bold mb-3">Location Required</h6>
                    <p className="text-muted small mb-4">Please enable location for best experience</p>
                    <button className="btn btn-primary w-100" onClick={handleEnableLocation}>
                        Enable Location
                    </button>
                </Modal.Body>
            </Modal> */}

            {/* Existing Modals */}
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
                    <img className="d-block w-100" src="https://img.etimg.com/thumb/msid-106775052,width-300,height-225,imgsize-69266,resizemode-75/mclaren-750s-launched-in-india-at-rs-5-91-crore-what-makes-it-so-expensive.jpg" alt="Slide" />
                </Carousel.Item>
            </Carousel>

            <div style={{ padding: '20px' }}>
                <h1 className="h3 fw-bold mb-4">Restaurants in Kurnool</h1>

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