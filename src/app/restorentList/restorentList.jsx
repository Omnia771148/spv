'use client';
import { useState, useEffect } from 'react';
import { Button, Carousel, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './restorentList.css';
import { restList } from './restorentDtata';
import RestorentDisplay from './restorentDisplay';
import { useRouter } from "next/navigation";
import Navbar from '@/navigation/page';

export default function RestorentList() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // ===== LOCATION CODE =====
  const [savedLink, setSavedLink] = useState(null);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(true);

  // ✅ FIX: Add this small check to stop the Red Error
  const [mounted, setMounted] = useState(false);

  const minLat = 15.77;
  const maxLat = 16.20;
  const minLon = 78.00;
  const maxLon = 78.12;

  // ✅ FIX: Set mounted to true only after the page loads in the browser
  useEffect(() => {
    setMounted(true);
  }, []);

  const requestLocation = async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const mapLink = `https://www.google.com/maps?q=$${latitude},${longitude}`;

          const inside =
            latitude >= minLat &&
            latitude <= maxLat &&
            longitude >= minLon &&
            longitude <= maxLon;

          if (inside) {
            setSavedLink(mapLink);
            setError(null);
            
            // Logic: Close popup if inside
            setShowPopup(false);

            try {
              const res = await fetch("/api/save-location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: mapLink }),
              });
              const data = await res.json();
              if (data.success) console.log("✅ Location saved!");
            } catch (err) {
              console.error("API error:", err);
            }
          } else {
            // Logic: Keep popup open if outside
            setError("❌ You are outside Kurnool City premises");
            setSavedLink(null);
            setShowPopup(true);
          }
        },
        (err) => {
           if(err.code === 1) {
             setError("⚠️ Please allow location access.");
           } else {
             setError("⚠️ Unable to retrieve location.");
           }
           setShowPopup(true);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
    } else {
      setError("⚠️ Geolocation is not supported.");
      setShowPopup(true);
    }
  };

  // 🔥 YOUR LOGIC: Polling every 3 seconds
  useEffect(() => {
    if (mounted) { // Only run if browser is ready
        requestLocation(); 
        const interval = setInterval(() => {
           requestLocation();
        }, 3000); 
        return () => clearInterval(interval); 
    }
  }, [mounted]); 
  // ===== LOCATION CODE END =====

  const router = useRouter();

  const handleClick = (name) => {
    if (name === "KNL") window.location.href = './knlrest';
    else if (name === "Snow Field") window.location.href = './snowfield';
    else if (name === "Kushas") window.location.href = './kushas';
    else alert(`${name} is clicked`);
  };

  // ✅ FIX: If the page isn't ready in the browser, don't render yet. 
  // This prevents the "Text content does not match" error.
  if (!mounted) return null;

  return (
    <div>
      {/* 🛑 POPUP MODAL */}
      <Modal 
        show={showPopup} 
        backdrop="static" 
        keyboard={false}  
        centered
      >
        <Modal.Header>
          <Modal.Title>📍 Location Check</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'center' }}>
          <h5>Checking your location...</h5>
          <p>You must be within Kurnool City premises to view restaurants.</p>
          
          {error ? (
             <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
          ) : (
             <p style={{ color: "blue" }}>⌛ Waiting for location...</p>
          )}
        </Modal.Body>
      </Modal>

      <br />
      <Carousel interval={3000} pause={false} className='coroselmain'>
        <Carousel.Item className='coroselmain2'>
          <img className="d" src="https://img.etimg.com/thumb/msid-106775052,width-300,height-225,imgsize-69266,resizemode-75/mclaren-750s-launched-in-india-at-rs-5-91-crore-what-makes-it-so-expensive.jpg" alt="First slide" />
        </Carousel.Item>
        <Carousel.Item className='coroselmain2'>
          <img className="d" src="https://img.etimg.com/thumb/msid-106775052,width-300,height-225,imgsize-69266,resizemode-75/mclaren-750s-launched-in-india-at-rs-5-91-crore-what-makes-it-so-expensive.jpg" alt="Second slide" />
        </Carousel.Item>
        <Carousel.Item className='coroselmain2'>
          <img className="d" src="https://img.etimg.com/thumb/msid-106775052,width-300,height-225,imgsize-69266,resizemode-75/mclaren-750s-launched-in-india-at-rs-5-91-crore-what-makes-it-so-expensive.jpg" alt="Third slide" />
        </Carousel.Item>
      </Carousel>

      <br />
      <h1>Search</h1>
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} />

      <br /><br /><br />
      <h2>Search Type</h2>
      <select onChange={(e) => setTypeFilter(e.target.value)} value={typeFilter}>
        <option value="">All</option>
        <option value="veg">Veg</option>
        <option value="non-veg">Non-Veg</option>
      </select>

      {restList
        .filter(item => {
          const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
          const matchesType = typeFilter === '' || item.type === typeFilter;
          return matchesSearch && matchesType;
        })
        .map(item => (
          <div key={item.name}>
            <button onClick={() => handleClick(item.name)} style={{ margin: '10px 0', padding: '10px 20px', backgroundColor: '#f8f8f8', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              <RestorentDisplay name={item.name} place={item.place} rating={item.rating} image={item.image}/>
            </button>
          </div>
        ))
      }

      {savedLink && <p>✅ Location Verified</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!savedLink && !error && <p>⌛ Checking location...</p>}
      <Navbar />

    </div>
  );
}