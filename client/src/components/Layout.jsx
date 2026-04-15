import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout(props) {
    const { user, setUser, isAuthenticated, setIsAuthenticated } = props

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Logout failed");
        } catch (err) {
            console.error("Logout failed: ", err)
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            navigate("/");
        }
    }

    return (
        <div className="app-shell">

            <header className="app-header">
                <Link to="/dashboard" className="app-header-brand">
                    FLYSCREEN ACADEMICS
                    <i className="fa-regular fa-paper-plane" />
                </ Link>

                {isAuthenticated && (
                    <div className="app-header-actions">
                        <Link to="/dashboard" style={{ textDecoration: "none" }}>
                        <button className="header-btn">
                            <p>Welcome {user?.username}</p>
                            <i className="fa-regular fa-user"></i>
                        </button>
                        </Link>
                        <button className="header-btn" onClick={() => handleLogout()}>
                            <p>Log out</p>
                            <i className="fa-solid fa-right-from-bracket"></i>
                        </button>
                    </div>
                )}
            </header>

            {isAuthenticated && <Navbar />}

            <main>
                <Outlet />
            </main>

            <footer className="app-footer">
                <p>Flyscreen Academics was developed by{" "}
                <a target="_blank" href="https://github.com/tateakasledgehammer">
                    tateakasledgehammer
                </a>{" "}
                using React.js<br/></p>
            </footer>

        </div>
    );
}