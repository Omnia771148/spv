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
    
    // UI State for Location and Navigation
    const [showPopup, setShowPopup] = useState(true); 
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [isRouting, setIsRouting] = useState(false); // ✅ Wait state for restaurant click

    const [locationVerified, setLocationVerified] = useState(false);
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

    const fetchAllDistances = useCallback(async (uLat, uLng) => {
        const cached = sessionStorage.getItem("sessionRoadDistances");
        if (cached) {
            setRoadDistances(JSON.parse(cached));
            return;
        }
        const results = {};
        await Promise.all(restList.map(async (item) => {
            try {
                const data = await getExactDistance(
                    { lat: parseFloat(uLat), lng: parseFloat(uLng) },
                    { lat: item.lat, lng: item.lng }
                );
                if (data) results[item.name] = data; 
            } catch (err) { console.error(err); }
        }));
        setRoadDistances(results);
        sessionStorage.setItem("sessionRoadDistances", JSON.stringify(results));
    }, []);

    const requestLocation = useCallback(() => {
        setLoadingLocation(true);
        const storedLat = localStorage.getItem("customerLat");
        const storedLng = localStorage.getItem("customerLng");
        const isSessionVerified = sessionStorage.getItem("isLocationChecked");

        if (isSessionVerified === "true" && storedLat && storedLng) {
            setLocationVerified(true);
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
                    sessionStorage.setItem("isLocationChecked", "true");
                    setLocationVerified(true);
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
        // ✅ 1. Show 'wait' spinner before routing
        setIsRouting(true);

        const info = roadDistances[name];
        const pureDistance = (info && info.km) ? info.km : "4.5";
        localStorage.setItem("deliveryDistanceKm", pureDistance.toString());

        const path = (name === "KNL") ? "/knlrest" : `/${name.toLowerCase().replace(/\s+/g, '')}`;
        
        // Use a slight timeout if the redirect feels too fast to see the loader
        router.push(path);
    };

    if (!mounted) return null;

    return (
        <div style={{ paddingBottom: '80px' }}>
            {/* 📍 Initial Location Detection Modal */}
            <Modal show={showPopup} centered backdrop="static">
                <Modal.Body className="text-center py-5">
                    {loadingLocation ? (
                        <>
                            <Spinner animation="border" variant="primary" className="mb-3" />
                            <h5 className="fw-bold">Detecting Location...</h5>
                        </>
                    ) : (
                        <>
                            <p className="fw-bold text-danger mb-3">{error}</p>
                            <button className="btn btn-primary btn-sm" onClick={() => {
                                hasRequestedThisMount.current = false;
                                requestLocation();
                            }}>Retry</button>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            {/* ⏳ Restaurant Navigation Wait Modal */}
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
                        .map(item => (
                            <div key={item.name} className="mb-3">
                                <button onClick={() => handleClick(item.name)} className="w-100 border-0 bg-transparent p-0">
                                    <RestorentDisplay 
                                        name={item.name} 
                                        place={item.place} 
                                        image={item.image}
                                        distance={roadDistances[item.name] ? `${roadDistances[item.name].km} km` : "..."}
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