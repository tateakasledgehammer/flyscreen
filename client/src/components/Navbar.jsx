import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <>
            <div className="nav-bar">
                <Link to="/overview">
                    <button>Home</button>
                </Link>

                <Link to="/setup">
                    <button>Setup</button>
                </Link>

                <Link to="/import">
                    <button>Import</button>
                </Link>

                <Link to="/tascreening">
                    <button>Screening</button>
                </Link>

                <Link to="/fulltext">
                    <button>Full Text</button>
                </Link>

                <Link to="/included">
                    <button>Included</button>
                </Link>

                <Link to="/excluded">
                    <button>Excluded</button>
                </Link>
            </div>
        </>
    )
}