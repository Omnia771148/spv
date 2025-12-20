"use client"

export default function Profile() {

    const handleLogout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("loginTimestamp");
        window.location.href = "/login";
    };

    return (
        <div>
            <div>
                <h1>Profile</h1>
            </div>

            <div className="container" style={{ backgroundColor: "brown" }}>
                <br></br>
                <div className="row">
                    <button onClick={() => window.location.href = "/userdetails"} style={{ backgroundColor: "green" }}>Edit Profile</button>
                </div>

                <br></br>
                <div className="row">
                    <button onClick={() => window.location.href = "/accepted-orders"} style={{ backgroundColor: "green" }}>Orders</button>
                </div>
                <br></br>

                <div className="row">
                    <button onClick={() => window.location.href = "/"} style={{ backgroundColor: "green" }}>Contact Us</button>
                </div>
                <br></br>

                <div className="row">
                    <button onClick={handleLogout} style={{ backgroundColor: "red" }}>Logout</button>
                </div>
                <br></br>
            </div>
        </div>
    )
}