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
    const [isRouting, setIsRouting] = useState(false); 
    const [isCalculating, setIsCalculating] = useState(false);
    
    const [roadDistances, setRoadDistances] = useState({}); 
    const distRef = useRef({});

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

    // ✅ OPTIMIZED: Checks LocalStorage first to prevent repeat API hits
    const fetchAllDistances = useCallback(async (uLat, uLng) => {
        // 1. Check LocalStorage
        const savedDistances = localStorage.getItem("allRestaurantDistances");
        
        if (savedDistances) {
            const parsed = JSON.parse(savedDistances);
            console.log("📦 Using Cached Distances from LocalStorage");
            setRoadDistances(parsed);
            distRef.current = parsed;
            return; // 🛑 EXIT: Do not hit the API
        }

        // 2. If nothing in LocalStorage, hit the API
        console.log("🌐 LocalStorage empty. Hitting Route API...");
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
        // 3. Save to LocalStorage for future route changes/visits
        localStorage.setItem("allRestaurantDistances", JSON.stringify(results));
    }, []);

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation || hasRequestedThisMount.current) return;
        hasRequestedThisMount.current = true;

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                
                // Save current location
                localStorage.setItem("customerLat", latitude);
                localStorage.setItem("customerLng", longitude);

                if (isPointInPolygon({ latitude, longitude }, kurnoolPolygon)) {
                    fetchAllDistances(latitude, longitude);
                } else {
                    setError("❌ Outside Service Area");
                }
            },
            () => { setError("⚠️ GPS access required."); },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [fetchAllDistances]);

    useEffect(() => { 
        setMounted(true); 
        requestLocation();
    }, [requestLocation]);

    const handleClick = (name) => {
        const currentDistance = distRef.current[name];

        if (!currentDistance) {
            setIsCalculating(true);
            const timer = setInterval(() => {
                const updatedDistance = distRef.current[name];
                if (updatedDistance) {
                    clearInterval(timer);
                    setIsCalculating(false);
                    proceedToRoute(name, updatedDistance);
                }
            }, 500);
            return;
        }
        proceedToRoute(name, currentDistance);
    };

    const proceedToRoute = (name, distance) => {
        setIsRouting(true);
        localStorage.setItem("deliveryDistanceKm", distance.toString());
        const path = (name === "KNL") ? "/knlrest" : `/${name.toLowerCase().replace(/\s+/g, '')}`;
        router.push(path);
    };

    if (!mounted) return null;

    return (
        <div style={{ paddingBottom: '80px' }}>
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