import { useState } from "react";

export default function Navbar() {
    return (
        <>
            <div className="nav-bar">
                {/* set up to go between pages */}
                <button>Home</button>
                <button>Import</button>
                <button>Setup</button>
                <button>Screening</button>
                <button>Full Text</button>
                <button>Included</button>
            </div>
        </>
    )
}