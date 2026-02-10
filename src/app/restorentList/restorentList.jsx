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

    // FORCE CHROME TO SHOW PERMISSION DIALOG
    const forceChromePermissionDialog = useCallback(() => {
        console.log("🚀 FORCING Chrome permission dialog...");
        
        setShowLocationModal(false);
        setShowFetchingModal(true);
        
        // Clear any cached permission state
        if (navigator.permissions && navigator.permissions.query) {
            // This resets the permission prompt state
            navigator.permissions.query({ name: 'geolocation' })
                .then(permissionStatus => {
                    console.log("Current permission state:", permissionStatus.state);
                })
                .catch(() => {});
        }
        
        // Use a timeout to ensure UI updates before permission request
        setTimeout(() => {
            if (!navigator.geolocation) {
                alert("Geolocation not supported");
                setShowFetchingModal(false);
                return;
            }
            
            // THIS IS THE KEY: Use VERY specific options
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    console.log("✅ SUCCESS: Chrome permission GRANTED!");
                    const { latitude, longitude } = position.coords;
                    
                    localStorage.setItem("customerLat", latitude.toString());
                    localStorage.setItem("customerLng", longitude.toString());
                    
                    // Calculate distances
                    console.log("📍 Calculating distances...");
                    const distances = {};
                    
                    // Use Promise.all for parallel requests
                    const promises = restList.map(async (restaurant) => {
                        try {
                            const data = await getExactDistance(
                                { lat: latitude, lng: longitude },
                                { lat: restaurant.lat, lng: restaurant.lng }
                            );
                            
                            if (data && data.km) {
                                distances[restaurant.name] = data.km;
                            } else {
                                const directDistance = getDistance(
                                    { latitude, longitude },
                                    { latitude: restaurant.lat, longitude: restaurant.lng }
                                );
                                distances[restaurant.name] = (directDistance / 1000).toFixed(1);
                            }
                        } catch (error) {
                            const directDistance = getDistance(
                                { latitude, longitude },
                                { latitude: restaurant.lat, longitude: restaurant.lng }
                            );
                            distances[restaurant.name] = (directDistance / 1000).toFixed(1);
                        }
                    });
                    
                    await Promise.all(promises);
                    
                    setRoadDistances(distances);
                    localStorage.setItem("allRestaurantDistances", JSON.stringify(distances));
                    console.log("📊 Distances:", distances);
                    
                    setShowFetchingModal(false);
                },
                (error) => {
                    console.log("❌ PERMISSION ERROR:", error.code, error.message);
                    setShowFetchingModal(false);
                    
                    // IMPORTANT: Show the exact error
                    switch (error.code) {
                        case 1:
                            // PERMISSION_DENIED - User clicked Block
                            alert("You clicked 'Block' in Chrome's permission dialog. Please allow location access.");
                            // Clear any cached blocked state
                            localStorage.removeItem("customerLat");
                            localStorage.removeItem("customerLng");
                            break;
                        case 2:
                            // POSITION_UNAVAILABLE - GPS might be off
                            alert("GPS/Location service is off. Please turn on location/GPS on your device.");
                            break;
                        case 3:
                            // TIMEOUT
                            alert("Location request timed out. Please try again.");
                            break;
                        default:
                            alert("Location error: " + error.message);
                    }
                },
                {
                    // THESE SETTINGS ARE CRITICAL FOR MOBILE
                    enableHighAccuracy: true,  // Forces GPS usage
                    timeout: 15000,           // 15 second timeout
                    maximumAge: 0             // No cached position
                }
            );
        }, 100); // Small delay to ensure modal shows
    }, []);

    // Handle "Allow Location" button
    const handleEnableLocation = () => {
        console.log("🖱️ User clicked Allow Location");
        forceChromePermissionDialog();
    };

    useEffect(() => {
        setMounted(true);

        // Auth check
        if (!localStorage.getItem("userId")) {
            router.replace("/login");
            return;
        }

        // Fetch restaurant statuses
        dispatch(fetchRestaurantStatuses());
        dispatch(fetchItemStatuses());

        // Auto-refresh
        const intervalId = setInterval(() => {
            dispatch(fetchRestaurantStatuses());
            dispatch(fetchItemStatuses());
        }, 20000);

        // Check for cached distances
        const savedDistances = localStorage.getItem("allRestaurantDistances");
        
        if (savedDistances) {
            try {
                const parsed = JSON.parse(savedDistances);
                setRoadDistances(parsed);
                console.log("✅ Using cached distances");
            } catch (e) {
                console.error("Error loading cached distances:", e);
            }
            setLoading(false);
        } else {
            // No cached data - show location modal
            console.log("📱 No cached data - showing location modal");
            
            // Check if permission was previously denied
            const checkPermissionState = () => {
                if (navigator.permissions && navigator.permissions.query) {
                    navigator.permissions.query({ name: 'geolocation' })
                        .then(permissionStatus => {
                            console.log("Permission state on load:", permissionStatus.state);
                            
                            if (permissionStatus.state === 'denied') {
                                // Already denied - don't show modal
                                console.log("❌ Permission already denied");
                                setLoading(false);
                            } else if (permissionStatus.state === 'granted') {
                                // Already granted - get location automatically
                                console.log("✅ Permission already granted");
                                forceChromePermissionDialog();
                                setLoading(false);
                            } else {
                                // 'prompt' state or unknown - show modal
                                setTimeout(() => {
                                    setShowLocationModal(true);
                                    setLoading(false);
                                }, 500);
                            }
                        })
                        .catch(() => {
                            // Permissions API not available
                            setTimeout(() => {
                                setShowLocationModal(true);
                                setLoading(false);
                            }, 500);
                        });
                } else {
                    // Permissions API not available
                    setTimeout(() => {
                        setShowLocationModal(true);
                        setLoading(false);
                    }, 500);
                }
            };
            
            checkPermissionState();
        }

        return () => clearInterval(intervalId);
    }, [dispatch, router, forceChromePermissionDialog]);

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

            {/* LOCATION MODAL */}
            <Modal show={showLocationModal} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <div className="mb-3">
                        <i className="fas fa-map-marker-alt fa-3x text-primary mb-3"></i>
                    </div>
                    <h5 className="fw-bold mb-3">Allow Location Access</h5>
                    <p className="text-muted small mb-4">
                        <strong>Chrome will show:</strong> "Allow this site to use your location?"
                        <br /><br />
                        Click <strong>Allow</strong> to see restaurant distances.
                    </p>
                    <button
                        className="btn btn-primary w-100 mb-3"
                        onClick={handleEnableLocation}
                        style={{ fontSize: '16px', padding: '12px' }}
                    >
                        🔐 ALLOW LOCATION ACCESS
                    </button>
                    <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                            setShowLocationModal(false);
                            localStorage.setItem("locationSkipped", "true");
                        }}
                    >
                        Skip for now
                    </button>
                </Modal.Body>
            </Modal>

            {/* FETCHING MODAL */}
            <Modal show={showFetchingModal} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <div className="mt-3 fw-bold">Requesting Location Access</div>
                    <div className="text-muted small mt-1">
                        Chrome is asking for permission...
                        <br />
                        Look for Chrome's popup!
                    </div>
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