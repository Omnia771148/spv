export default function RestorentDisplay({ name, place, rating, image, distance }) {
    // Logic so we can still display "Ganesh Nagar" separate from "Kurnool" if desired,
    // even though this component layout is the "Vertical Card" style you just pasted.
    // But generally, the user just wants THIS EXACT CODE back.

    return (
        <div className="rest-card-main">
            <div className="rest-card-main2 shadow-sm rounded bg-white p-2" >
                {/* Restaurant Image */}
                <div style={{ position: "relative" }}>
                    <img
                        src={image}
                        alt={name}
                        className="rest-image"
                        style={{
                            width: "100%",
                            height: "160px",
                            objectFit: "cover",
                            borderRadius: "10px"
                        }}
                    />
                    {/* Rating Badge Overlay */}
                    <div
                        className="badge bg-success"
                        style={{ position: "absolute", bottom: "10px", left: "10px", fontSize: "12px" }}
                    >
                        ⭐ {rating}
                    </div>
                </div>

                {/* Text Details */}
                <div className="mt-2" style={{ textAlign: "left" }}>
                    <h3 className="rest-title h6 fw-bold mb-1 text-dark">{name}</h3>
                    <p className="text-muted mb-2" style={{ fontSize: "13px" }}>{place}</p>

                    <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-1">
                        {/* Distance Display */}
                        <span style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>
                            📍 {distance || "Finding distance..."}
                        </span>

                    </div>
                </div>
            </div>
        </div>
    );
}