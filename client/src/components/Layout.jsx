import { useState } from "react";

export default function Layout(props) {
    const { children, user, setUser, isAuthenticated, setIsAuthenticated } = props

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5005/logout", {
                credentials: "include",
            });
            setIsAuthenticated(false);
            setUser(null)
        } catch (err) {
            console.error("Logout failed: ", err)
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
                    </button>
                </>
            )}
            
        </header>
    )

    const footer = (
        <footer>
            <p>Flyscreen Academics was developed by <a target="_blank" href="https://github.com/tateakasledgehammer">tateakasledgehammer</a> using React.js<br/>
            </p>
        </footer>
    )

    return (
        <>
            { header }
            <main>
                { children }
            </main>
            { footer }
        </>
    )
}