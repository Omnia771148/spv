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

export default function RestorentList() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState(''); 
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState(null);
    
    const [showPopup, setShowPopup] = useState(true); 
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [isRouting, setIsRouting] = useState(false); 

    const [roadDistances, setRoadDistances] = useState({}); 
    const router = useRouter();
    const hasRequestedThisMount = useRef(false);

    const kurnoolPolygon = [
        { latitude: 15.845928, longitude: 78.012744 },
        { latitude: 15.846311, longitude: 78.019729 },
        { latitude: 15.839716, longitude: 78.027036 },
        { latitude: 15.846872, longitude: 78.031149 },
        { latitude: 15.84623,  longitude: 78.034459 },
        { latitude: 15.838115, longitude: 78.049654 },
        { latitude: 15.82565,  longitude: 78.056682 },
        { latitude: 15.818905, longitude: 78.060495 },
        { latitude: 15.815102, longitude: 78.065114 },
        { latitude: 15.801613, longitude: 78.072318 },
        { latitude: 15.798335, longitude: 78.078557 },
        { latitude: 15.79411,  longitude: 78.078435 },
        { latitude: 15.786917, longitude: 78.078888 },
        { latitude: 15.776939, longitude: 78.073002 },
        { latitude: 15.772624, longitude: 78.057852 },
        { latitude: 15.768974, longitude: 78.054399 },
        { latitude: 15.765935, longitude: 78.049634 },
        { latitude: 15.77651,  longitude: 78.02883 },
        { latitude: 15.813778, longitude: 77.996924 },
        { latitude: 15.847026, longitude: 78.005964 }
    ];

    // ✅ FIXED: Uses LocalStorage only
    const fetchAllDistances = useCallback(async (uLat, uLng) => {
        // Check LocalStorage first
        const cached = localStorage.getItem("allRestaurantDistances");
        if (cached) {
            setRoadDistances(JSON.parse(cached));
            // Even if cached, we don't return here if you want to refresh distances 
            // but for performance, we'll use the cache.
            return;
        }

        const results = {};
        await Promise.all(restList.map(async (item) => {
            try {
                const data = await getExactDistance(
                    { lat: parseFloat(uLat), lng: parseFloat(uLng) },
                    { lat: item.lat, lng: item.lng }
                );
                
                if (data && data.km) {
                    results[item.name] = data.km;
                } else if (typeof data === 'number' || typeof data === 'string') {
                    results[item.name] = data; 
                }
            } catch (err) { 
                console.error(`Error for ${item.name}:`, err); 
            }
        }));

        setRoadDistances(results);
        // ✅ Store in LocalStorage permanently
        localStorage.setItem("allRestaurantDistances", JSON.stringify(results));
    }, []);

    const requestLocation = useCallback(() => {
        setLoadingLocation(true);
        const storedLat = localStorage.getItem("customerLat");
        const storedLng = localStorage.getItem("customerLng");
        const isVerified = localStorage.getItem("isLocationVerified");

        // ✅ If already verified in LocalStorage, just load
        if (isVerified === "true" && storedLat && storedLng) {
            setLoadingLocation(false);
            setShowPopup(false);
            fetchAllDistances(storedLat, storedLng);
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
                    localStorage.setItem("isLocationVerified", "true"); // ✅ Use LocalStorage
                    setLoadingLocation(false);
                    setShowPopup(false); 
                    fetchAllDistances(latitude, longitude);
                } else {
                    setError("❌ Outside Serviceable Area");
                    setLoadingLocation(false);
                }
            },
            () => {
                setError("⚠️ Please enable GPS.");
                setLoadingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [fetchAllDistances]);

    useEffect(() => { 
        setMounted(true); 
        requestLocation();
    }, [requestLocation]);

    const handleClick = async (name) => {
        setIsRouting(true);
        const dist = roadDistances[name] || "4.5";
        localStorage.setItem("deliveryDistanceKm", dist.toString());

        const path = (name === "KNL") ? "/knlrest" : `/${name.toLowerCase().replace(/\s+/g, '')}`;
        router.push(path);
    };

    if (!mounted) return null;

    return (
        <div style={{ paddingBottom: '80px' }}>
            {/* 📍 Location Modal */}
            <Modal show={showPopup} centered backdrop="static">
                <Modal.Body className="text-center py-5">
                    {loadingLocation ? (
                        <>
                            <Spinner animation="border" variant="primary" className="mb-3" />
                            <h5 className="fw-bold">Checking Location...</h5>
                        </>
                    ) : (
                        <>
                            <p className="fw-bold text-danger mb-3">{error}</p>
                            <button className="btn btn-primary btn-sm" onClick={() => {
                                hasRequestedThisMount.current = false;
                                localStorage.removeItem("isLocationVerified"); // Reset to try again
                                requestLocation();
                            }}>Retry</button>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            {/* ⏳ Wait Spinner */}
            <Modal show={isRouting} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <Spinner animation="grow" variant="warning" size="sm" />
                    <div className="mt-2 fw-bold text-muted small">Opening Restaurant...</div>
                </Modal.Body>
            </Modal>

            <Carousel interval={3000} className='coroselmain'>
                <Carousel.Item className='coroselmain2'>
                    <img className="d-block w-100" src="https://img.etimg.com/thumb/msid-106775052,width-300,height-225,imgsize-69266,resizemode-75/mclaren-750s-launched-in-india-at-rs-5-91-crore-what-makes-it-so-expensive.jpg" alt="Slide" />
                </Carousel.Item>
            </Carousel>

            <div style={{ padding: '20px' }}>
                <h1 className="h3 fw-bold mb-4">Restaurants</h1>
                <input type="text" className="form-control mb-3" placeholder="Search..." onChange={(e) => setSearch(e.target.value)} />

                <select className="form-select mb-4" onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="veg">Veg Only</option>
                    <option value="non-veg">Non-Veg Only</option>
                </select>

                <div className="mt-4">
                    {restList
                        .filter(item => {
                            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
                            const matchesType = typeFilter === '' || item.type === typeFilter;
                            return matchesSearch && matchesType;
                        })
                        .map(item => {
                            const distanceVal = roadDistances[item.name];
                            return (
                                <div key={item.name} className="mb-3">
                                    <button onClick={() => handleClick(item.name)} className="w-100 border-0 bg-transparent p-0">
                                        <RestorentDisplay 
                                            name={item.name} 
                                            place={item.place} 
                                            image={item.image}
                                            distance={distanceVal ? `${distanceVal} km` : "..."}
                                        />
                                    </button>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
            <Navbar />
        </div>
    );
}