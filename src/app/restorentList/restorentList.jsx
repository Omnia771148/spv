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
    const [showPopup, setShowPopup] = useState(false); 
    const [locationVerified, setLocationVerified] = useState(false);
    const [roadDistances, setRoadDistances] = useState({});
    const [isRouting, setIsRouting] = useState(false); 
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

    // ✅ MODIFIED: Hits Google API only if not in SessionStorage
    const fetchAllDistances = useCallback(async (uLat, uLng) => {
        // 1. Check if we already have the distances for THIS session
        const cachedDistances = sessionStorage.getItem("sessionRoadDistances");
        if (cachedDistances) {
            console.log("🚀 Loading distances from Cache (No API Hit)");
            setRoadDistances(JSON.parse(cachedDistances));
            return;
        }

        console.log("🌐 Hitting Google API for distances...");
        const results = {};
        await Promise.all(restList.map(async (item) => {
            try {
                const data = await getExactDistance(
                    { lat: parseFloat(uLat), lng: parseFloat(uLng) },
                    { lat: item.lat, lng: item.lng }
                );
                if (data) results[item.name] = data; 
            } catch (err) {
                console.error(`Distance error for ${item.name}:`, err);
            }
        }));

        // 2. Save results to SessionStorage for this session
        setRoadDistances(results);
        sessionStorage.setItem("sessionRoadDistances", JSON.stringify(results));
    }, []);

    const requestLocation = useCallback(() => {
        const isSessionVerified = sessionStorage.getItem("isLocationChecked");
        const storedLat = localStorage.getItem("customerLat");
        const storedLng = localStorage.getItem("customerLng");

        // If verified this session, request distances (which will now check cache first)
        if (isSessionVerified === "true" && storedLat && storedLng) {
            setLocationVerified(true);
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
                    setError(null);
                    setShowPopup(false); 
                    fetchAllDistances(latitude, longitude);
                } else {
                    setError("❌ Outside Kurnool City");
                    setLocationVerified(false);
                    setShowPopup(true);
                }
            },
            (err) => {
                setError("⚠️ Please enable GPS to calculate delivery charges.");
                setShowPopup(true);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [fetchAllDistances]);

    useEffect(() => { 
        setMounted(true); 
        requestLocation();
    }, [requestLocation]);

    const handleClick = async (name, itemCoords) => {
        let info = roadDistances[name];
        
        // Save distance for Cart math
        const pureDistance = (info && info.km) ? info.km : "4.5";
        localStorage.setItem("deliveryDistanceKm", pureDistance.toString());

        const dynamicPath = `/${name.toLowerCase().replace(/\s+/g, '')}`;
        const finalPath = (name === "KNL") ? "/knlrest" : dynamicPath;

        router.push(finalPath);
    };

    if (!mounted) return null;

    return (
        <div style={{ paddingBottom: '80px' }}>
            {/* Modal for Location Errors */}
            <Modal show={showPopup} centered backdrop="static">
                <Modal.Body className="text-center py-4">
                    <p className="fw-bold">{error || "Detecting your location..."}</p>
                    {error && (
                        <button 
                            className="btn btn-sm btn-primary" 
                            onClick={() => {
                                hasRequestedThisMount.current = false;
                                requestLocation();
                            }}
                        >
                            Retry
                        </button>
                    )}
                </Modal.Body>
            </Modal>

            {/* Wait Spinner */}
            <Modal show={isRouting} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-3">
                    <Spinner animation="border" variant="primary" size="sm" />
                    <div className="mt-2 small fw-bold text-muted">wait</div>
                </Modal.Body>
            </Modal>

            {/* Content Rendering */}
            <Carousel interval={3000} pause={false} className='coroselmain'>
                <Carousel.Item className='coroselmain2'>
                    <img className="d-block w-100" src="https://img.etimg.com/thumb/msid-106775052,width-300,height-225,imgsize-69266,resizemode-75/mclaren-750s-launched-in-india-at-rs-5-91-crore-what-makes-it-so-expensive.jpg" alt="Slide" />
                </Carousel.Item>
            </Carousel>

            <div style={{ padding: '20px' }}>
                <h1 className="h3 fw-bold mb-4">Restaurants in Kurnool</h1>
                <input 
                    type="text" 
                    className="form-control mb-3 shadow-sm border-0" 
                    placeholder="Search..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} 
                />

                <div className="mt-4">
                    {restList
                        .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
                        .map(item => {
                            const info = roadDistances[item.name];
                            return (
                                <div key={item.name} className="mb-3">
                                    <button 
                                        onClick={() => handleClick(item.name, { lat: item.lat, lng: item.lng })} 
                                        style={{ width: '100%', border: 'none', background: 'none', padding: 0 }}
                                    >
                                        <RestorentDisplay 
                                            name={item.name} 
                                            place={item.place} 
                                            rating={item.rating} 
                                            image={item.image}
                                            distance={info ? `${info.km} km` : "..."}
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