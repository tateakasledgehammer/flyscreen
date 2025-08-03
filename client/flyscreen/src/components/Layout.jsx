import { useState } from "react";

export default function Layout(props) {
    const { children, isAuthenticated } = props

    const header = (
        <header>
            <div>
                <h3>Flyscreen Academics <i className="fa-regular fa-paper-plane"></i></h3>
            </div>
            <button>
                <i className="fa-regular fa-user"></i>
            </button>
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