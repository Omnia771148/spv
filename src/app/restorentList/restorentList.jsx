'use client';
import { useState, useEffect } from 'react';
import { Carousel, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './restorentList.css';
import { restList } from './restorentDtata';
import RestorentDisplay from './restorentDisplay';
import { useRouter } from "next/navigation";
import Navbar from '@/navigation/page';
import { isPointInPolygon } from "geolib"; 

export default function RestorentList() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [mounted, setMounted] = useState(false);
    
    // ===== LOCATION STATE =====
    const [error, setError] = useState(null);
    // ✅ CHANGED: Set showPopup to false by default
    const [showPopup, setShowPopup] = useState(false); 
    const [locationVerified, setLocationVerified] = useState(false);

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

    useEffect(() => {
        setMounted(true);
    }, []);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setError("⚠️ Geolocation is not supported.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;

                const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                localStorage.setItem("customerLocationUrl", mapLink);
                // Also save raw coordinates for your Cart page logic
                localStorage.setItem("customerLat", latitude);
                localStorage.setItem("customerLng", longitude);

                const inside = isPointInPolygon(
                    { latitude, longitude },
                    kurnoolPolygon
                );

                if (inside) {
                    setLocationVerified(true);
                    setError(null);
                    setShowPopup(false); 

                    try {
                        await fetch("/api/save-location", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ 
                                lat: latitude, 
                                lng: longitude,
                                url: mapLink 
                            }),
                        });
                    } catch (err) {
                        console.error("API error:", err);
                    }
                } else {
                    setError("❌ Outside Kurnool");
                    setLocationVerified(false);
                    // ✅ REMOVED: setShowPopup(true) so users aren't blocked
                }
            },
            (err) => {
                console.error("Location Error:", err);
                setError("⚠️ Location error.");
                // ✅ REMOVED: setShowPopup(true)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    useEffect(() => {
        if (mounted) {
            requestLocation();
            const interval = setInterval(requestLocation, 10000); // Increased to 10s to save battery
            return () => clearInterval(interval);
        }
    }, [mounted]);

    const router = useRouter();

    const handleClick = (name) => {
        if (name === "KNL") router.push('/knlrest');
        else if (name === "Snow Field") router.push('/snowfield');
        else if (name === "Kushas") router.push('/kushas');
        else alert(`${name} is clicked`);
    };

    if (!mounted) return null;

    return (
        <div>
            {/* 📍 POPUP MODAL is still here but will not show unless showPopup is manually set to true */}
            <Modal show={showPopup} backdrop="static" keyboard={false} centered>
                <Modal.Header>
                    <Modal.Title>📍 Location Check</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ textAlign: 'center' }}>
                    <p>{error || "Detecting your location..."}</p>
                    <button onClick={requestLocation} className="btn btn-primary btn-sm mt-2">
                        Retry
                    </button>
                </Modal.Body>
            </Modal>

            <Carousel interval={3000} pause={false} className='coroselmain'>
                <Carousel.Item className='coroselmain2'>
                    <img className="d" src="https://img.etimg.com/thumb/msid-106775052,width-300,height-225,imgsize-69266,resizemode-75/mclaren-750s-launched-in-india-at-rs-5-91-crore-what-makes-it-so-expensive.jpg" alt="Slide" />
                </Carousel.Item>
            </Carousel>

            <div style={{ padding: '20px' }}>
                <h1>Search</h1>
                <input 
                    type="text" 
                    className="form-control"
                    placeholder="Search restaurants..."
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                />

                <h4 className="mt-4">Category</h4>
                <select className="form-select" onChange={(e) => setTypeFilter(e.target.value)} value={typeFilter}>
                    <option value="">All Types</option>
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
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
                                <button 
                                    onClick={() => handleClick(item.name)} 
                                    style={{ width: '100%', border: 'none', background: 'none', padding: 0 }}
                                >
                                    <RestorentDisplay name={item.name} place={item.place} rating={item.rating} image={item.image}/>
                                </button>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Small subtle indicator that location is verified */}
            {locationVerified && (
                <div style={{ position: 'fixed', bottom: '80px', right: '20px', backgroundColor: 'rgba(0,128,0,0.7)', color: 'white', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', zIndex: 1000 }}>
                    📍 Serviceable Area
                </div>
            )}
            
            <Navbar />
        </div>
    );
}