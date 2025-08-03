import { useState } from "react";

export default function Navbar() {
    return (
        <>
            <ul>
                {/* set up to go between pages */}
                <li>Home</li>
                <li>Import</li>
                <li>Setup</li>
                <li>Screening</li>
                <li>Full Text</li>
                <li>Included</li>
            </ul>
        </>
    )
}