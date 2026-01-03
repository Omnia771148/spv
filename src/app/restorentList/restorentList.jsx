'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Carousel, Modal, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './restorentList.css';
import { restList } from './restorentDtata'; 
import RestorentDisplay from './restorentDisplay';
import { useRouter } from "next/navigation";
import Navbar from '@/navigation/page';
// import { isPointInPolygon } from "geolib"; // ❌ location based
// import { getExactDistance } from '../actions/delivery'; // ❌ location based
import Loading from "../loading/page"; // Added import

export default function RestorentList() {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState(''); 
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState(null);
    const [isRouting, setIsRouting] = useState(false); 
    const [isCalculating, setIsCalculating] = useState(false);
    
    // const [showLocationModal, setShowLocationModal] = useState(false); // ❌ location based
    // const [showFetchingModal, setShowFetchingModal] = useState(false); // ❌ location based
    // const [locationDenied, setLocationDenied] = useState(false); // ❌ location based
    
    const [roadDistances, setRoadDistances] = useState({}); 
    const distRef = useRef({});

    const router = useRouter();
    const hasRequestedThisMount = useRef(false);

    /*
    const kurnoolPolygon = [   // ❌ location based
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
    */

    /*
    const fetchAllDistances = useCallback(async (uLat, uLng) => {  // ❌ location based
        const results = {};
        await Promise.all(restList.map(async (item) => {
            const data = await getExactDistance(
                { lat: parseFloat(uLat), lng: parseFloat(uLng) },
                { lat: item.lat, lng: item.lng }
            );
            if (data && data.km) {
                results[item.name] = data.km;
            }
        }));
        setRoadDistances(results);
        distRef.current = results;
        localStorage.setItem("allRestaurantDistances", JSON.stringify(results));
        sessionStorage.setItem("isAppLoaded", "true");
    }, []);
    */

    /*
    const requestLocation = useCallback(() => {   // ❌ location based
        if (!navigator.geolocation || hasRequestedThisMount.current) return;
        hasRequestedThisMount.current = true;

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                if (isPointInPolygon({ latitude, longitude }, kurnoolPolygon)) {
                    await fetchAllDistances(latitude, longitude);
                }
            },
            () => setError("GPS denied")
        );
    }, [fetchAllDistances]);
    */

    /*
    const handleEnableLocation = () => {  // ❌ location based
        setShowLocationModal(false);
        setShowFetchingModal(true);
        requestLocation();
    };
    */

    useEffect(() => { 
        setMounted(true); 
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
        } else if (name === "Broes story") {
          window.location.href = './Browsstory';
        } else {
          window.location.href = './lanjesh';
        }
    };

    if (!mounted || loading) return <Loading />;

    return (
        <div style={{ paddingBottom: '80px' }}>

            {/* ❌ location based modals commented */}
            {/*
            <Modal show={showLocationModal} />
            <Modal show={showFetchingModal} />
            <Modal show={locationDenied} />
            */}

            <Modal show={isRouting} centered backdrop="static" size="sm">
                <Modal.Body className="text-center py-4">
                    <Spinner animation="grow" variant="success" size="sm" />
                    <div className="mt-2 fw-bold text-muted small">
                        Entering Restaurant...
                    </div>
                </Modal.Body>
            </Modal>

            <Carousel interval={3000} className='coroselmain'>
                <Carousel.Item className='coroselmain2'>
                    <img className="d-block w-100"
                        src="https://img.etimg.com/thumb/msid-106775052,width-300,height-225,imgsize-69266,resizemode-75/mclaren-750s-launched-in-india-at-rs-5-91-crore-what-makes-it-so-expensive.jpg"
                        alt="Slide"
                    />
                </Carousel.Item>
            </Carousel>

            <div style={{ padding: '20px' }}>
                <h1 className="h3 fw-bold mb-4">Restaurants in Kurnool</h1>

                <input type="text"
                    className="form-control mb-3 shadow-sm border-0"
                    placeholder="Search..."
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="form-select mb-4 shadow-sm border-0"
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="">All Types</option>
                    <option value="veg">Veg Only</option>
                    <option value="non-veg">Non-Veg Only</option>
                </select>

                <div className="mt-4">
                    {restList
                        .filter(item =>
                            item.name.toLowerCase().includes(search.toLowerCase()) &&
                            (typeFilter === '' || item.type === typeFilter)
                        )
                        .map(item => (
                            <div key={item.name} className="mb-3">
                                <button
                                    onClick={() => handleClicke(item.name)}
                                    className="w-100 border-0 bg-transparent p-0"
                                >
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
