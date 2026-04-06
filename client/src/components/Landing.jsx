import { useState, useEffect } from "react";
import Authentication from "./Authentication";

export default function Landing({ isAuthenticated, setIsAuthenticated, setUser }) {
    return (
        <div className="landing-container">

            <header className="landing-hero">
                <h1 className="landing-title">
                    Welcome to <span>Flyscreen Academics</span> <i className="fa-regular fa-paper-plane"></i>
                </h1>
                <p className="landing-subtitle">
                    Smarter screening. Faster reviews. More time for real research.
                </p>
            </header>

            <section className="landing-features">
                <div className="feature-block">
                    <h3><i className="fa-solid fa-star-half-stroke"></i> Predictive scoring that saves hours</h3>
                    <p>
                        Systematic reviews often take <strong>12–18 months</strong> to complete. 
                        A huge portion of that time is spent sifting through irrelevant studies.
                        Flyscreen Academics gives each study a relevance score before you even start reading,
                        helping you focus your attention where it matters.
                    </p>
                </div>

                <div className="feature-block">
                    <h3><i className="fa-solid fa-chart-bar"></i> Powerful filtering for real research workflows</h3>
                    <p>
                        Combine tags, exclusion criteria, and keyword filters to rapidly narrow down your search.
                        Designed for academic teams who need clarity, speed, and precision.
                    </p>
                </div>

                <div className="feature-block">
                    <h3><i className="fa-solid fa-chart-line"></i> A streamlined process from start to finish</h3>
                    <p>
                        Flyscreen guides you through a clean, intuitive workflow — from project setup to full‑text review.
                        No clutter. No confusion. Just a smooth path to getting your review done.
                    </p>
                </div>
            </section>

            <section className="landing-auth">
                <Authentication
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                    setUser={setUser}
                />
            </section>
        </div>
    );
}
