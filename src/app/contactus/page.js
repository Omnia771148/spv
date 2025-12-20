"use client"

export default function Contactus(){
    return(
    <div>
        <div>
            <h1>Contactus</h1>
        </div>


            <div className="container" style={{ backgroundColor: "brown" }}>
                <br></br>
                <div className="row">
                    <button onClick={() => window.location.href = "/Profile"} style={{ backgroundColor: "green" }}>+91 100</button>
                </div>


                <br></br>
                <div className="row">
                    <button onClick={() => window.location.href = "/Profile"} style={{ backgroundColor: "green" }}>spv@gmail.com</button>
                </div>
                <br></br>


                
                <div className="row">
                    <button onClick={() => window.location.href = "/Profile"} style={{ backgroundColor: "green" }}>insta</button>
                </div>
                <br></br>



                 <div className="row">
                    <button onClick={() => window.location.href = "/Profile"}>Facebook</button>
                </div>
                <br></br>



                <div className="row">
                    <button onClick={() => window.location.href = "/Profile"}>Twitter</button>
                </div>
                <br></br>


            </div>
        
    </div>
    )
}