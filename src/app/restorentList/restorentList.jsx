'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Carousel, Modal, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
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

    // Location modal states - COMMENTED
    // const [showLocationModal, setShowLocationModal] = useState(false);
    // const [showFetchingModal, setShowFetchingModal] = useState(false);
    // const [locationDenied, setLocationDenied] = useState(false);

    // Location distance states - COMMENTED
    // const [roadDistances, setRoadDistances] = useState({});
    // const distRef = useRef({});

    const router = useRouter();
    
    // Location request tracking - COMMENTED
    // const hasRequestedThisMount = useRef(false);

    // Kurnool polygon boundary - COMMENTED
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

    // Fetch distances function - COMMENTED
    /*
    const fetchAllDistances = useCallback(async (uLat, uLng) => {
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
    }, []);
    */

    // Request location function - COMMENTED
    /*
    const requestLocation = useCallback(() => {
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

        if (!navigator.geolocation || hasRequestedThisMount.current) return;
        hasRequestedThisMount.current = true;

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                console.log("✅ Location obtained:", { latitude, longitude });

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
                    case 1:
                        errorMessage += "📱 Enable location permissions";
                        break;
                    case 2:
                        errorMessage += "📶 Check internet connection";
                        break;
                    case 3:
                        errorMessage += "⏰ Location timed out";
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
                enableHighAccuracy: false,
                timeout: 20000,
                maximumAge: 300000
            }
        );
    }, [fetchAllDistances]);
    */

    // Enable location handler - COMMENTED
    /*
    const handleEnableLocation = () => {
        setShowLocationModal(false);
        setShowFetchingModal(true);
        requestLocation();
    };
    */

    useEffect(() => {
        setMounted(true);
        
        // Location initialization logic - COMMENTED
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
        // Using hardcoded distance since location is disabled - MODIFIED
        const currentDistance = "0.0"; // distRef.current[name] || "0.0";
        proceedToRoute(name, currentDistance);
    };

    const handleClicke = (name) => {
        if (name === "KNL") {
            window.location.href = './knlrest';
        } else if (name === "Snow Field") {
            window.location.href = './snowfield';
        } else if (name === "Kushas") {
            window.location.href = './kushas';
        } else if (name === "Bro Story") {
            window.location.href = './brostory';
        } else if (name === "The Mourya Inn") {
            window.location.href = './mourya';
        }
    };

    if (!mounted || loading) return <Loading />;

    return (
        <div style={{ paddingBottom: '80px' }}>
            
            {/* Location Modal - COMMENTED */}
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

            {/* Fetching Modal - COMMENTED */}
            {/*
            <Modal show={showFetchingModal} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <div className="mt-3 fw-bold">Fetching Location...</div>
                    <div className="text-muted small mt-1">Please wait</div>
                </Modal.Body>
            </Modal>
            */}

            {/* Location Denied Modal - COMMENTED */}
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
                <input type="text" className="form-control mb-3 shadow-sm border-0" placeholder="Search..." onChange={(e) => setSearch(e.target.value)} />
                <select className="form-select mb-4 shadow-sm border-0" onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="veg">Veg Only</option>
                    <option value="non-veg">Non-Veg Only</option>
                </select>
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
                                        // Using static distance since location is disabled - MODIFIED
                                        distance={"..."} // {roadDistances[item.name] ? `${roadDistances[item.name]} km` : "..."}
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