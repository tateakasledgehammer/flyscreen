import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function Layout(props) {
    const { user, setUser, isAuthenticated, setIsAuthenticated } = props

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const res = await fetch("http://localhost:5005/api/logout", {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Logout failed");
        } catch (err) {
            console.error("Logout failed: ", err)
        } finally {
            setIsAuthenticated(false);
            setUser(null)
            navigate("/")
        }
    }

    const header = (
        <header>
            <div>
                <h3>Flyscreen Academics <i className="fa-regular fa-paper-plane"></i></h3>
            </div>
            
            {isAuthenticated && (
                <>
                    <button>
                        <p>Welcome {user.username}</p>
                        <i className="fa-regular fa-user"></i>
                    </button>
                    <button onClick={() => handleLogout()}>
                        <p>Log out</p>
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </button>
                </>
            )}
            
        </header>
    )

    const footer = (
        <footer>
            <p>Flyscreen Academics was developed by 
                <a 
                    target="_blank" 
                    href="https://github.com/tateakasledgehammer"
                    >
                        tateakasledgehammer
                </a> 
                using React.js<br/>
            </p>
        </footer>
    )

    return (
        <div className="page-container">
            { header }
            <main>
                <Outlet />
            </main>
            { footer }
        </div>
    )
}