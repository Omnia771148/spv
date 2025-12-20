"use client"

export default function Profile(){
    return(
    <div>
        <div>
            <h1>Profile</h1>
        </div>


            <div className="container" style={{ backgroundColor: "brown" }}>
                <br></br>
                <div className="row">
                    <button onClick={() => window.location.href = "/cart"} style={{ backgroundColor: "green" }}>Edit Profile</button>
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


            </div>
        
    </div>
    )
}