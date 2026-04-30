import Authentication from "./Authentication";
import { useState } from "react";
import "../landing.css";

export default function Landing({ isAuthenticated, setIsAuthenticated, setUser }) {
    const [contactEmail, setContactEmail] = useState("");
    const [contactOrg, setContactOrg] = useState("");
    const [contactMsg, setContactMsg] = useState("");
    const [footerEmail, setFooterEmail] = useState("");
    const [footerMsg, setFooterMsg] = useState("");

    async function handleContactSubmit(e) {
        e.preventDefault();
        const res = await fetch("/api/auth/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                email: contactEmail,
                organisation: contactOrg,
                source: "contact_form"
            })
        });
        const data = await res.json();
        setContactMsg(data.success ? "Thanks! We'll be in touch." : "Something went wrong..");
        setContactEmail("");
        setContactOrg("");
    }

    async function handleFooterSubscribe(e) {
        e.preventDefault();
        const res = await fetch("/api/auth/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                email: footerEmail,
                source: "footer"
            })
        });
        const data = await res.json();
        setFooterMsg(data.success ? "Subscribed!" : "Something went wrong..");
        setFooterEmail("");
    }

    return (
        <div className="landing-page">

            {/* ── STICKY CENTRED HEADER — Urban Climb style ── */}
            <div className="landing-header">
                <div className="landing-header-inner">
                    FLYSCREEN.
                    <i className="fa-regular fa-paper-plane" />
                </div>
                {/* <div className="landing-header-menu">
                    <span /><span /><span />
                </div> */}
            </div>

            {/* Video */}
            <div className="media-col">
                <h3 className="media-col-heading">SCREEN FASTER</h3>
                <p>Your next review: Coming in 2 months, not 12</p>
                <div className="video-wrapper">
                    <iframe
                        src="https://www.loom.com/embed/6c2a29fae894487a8417c66ae99ca26d"
                        title="Flyscreen Academics Demo"
                        allowFullScreen
                    />
                    <div className="video-placeholder">
                        <i className="fa-regular fa-circle-play" />
                        <h2>Video loading!</h2>
                    </div>
                </div>

                <p>
                    AI-powered systematic review screening for research teams to
                    cut months of work down to weeks.
                </p>

                <div style={{ textAlign: "center", margin: "16px" }}>
                    <a href="#contact-us" style={{
                        display: "inline-block",
                        background: "var(--ink)",
                        color: "var(--cream)",
                        fontFamily: "var(--font-display)",
                        fontSize: "1rem",
                        padding: "10px 24px",
                        textDecoration: "none",
                        letterSpacing: "0.06em",
                    }}>
                        BOOK AN INFO SESH →
                    </a>
                </div>

            </div>

            {/* ── THREE-COLUMN INFO GRID ── */}
            <div className="info-grid">

                {/* Col 1 — Acknowledgement of country */}
                <div className="info-col">
                    {/* <span className="info-col-label">ACKNOWLEDGEMENT</span> */}
                    <p>
                        We acknowledge the Traditional Owners of the lands on which
                        we work and live. We pay our respects to Elders past and
                        present, and to all Aboriginal and Torres Strait Islander
                        peoples.
                        Flyscreen Academics was built to support rigorous, open
                        research for the benefit of all communities.
                    </p>

                    <br />

                    <span className="info-col-label">WHY FLYSCREEN WAS BUILT.</span>
                    <h3>
                        You didn't do a PhD to read headings and scan abstracts.
                    </h3>
                    <br />
                    <p>
                        Last year, in doing a systematic review for a thesis, 
                        our team of senior academics spent evenings screening studies that a filter
                        could have flagged as irrelevant. Flyscreen is the solution so the next team
                        doesn't have to do the same.
                    </p>
                    <br />

                    <br />

                    <span id="contact-us" className="info-col-label">HAVE QUESTIONS?</span>
                    <h3>Email us: </h3>
                        <p>hello@flyscreenacademics.com.au</p>
                    <br />
                    {/* <h3>Call us: </h3>
                        <p>0412 345 678</p> */}
                    <h3>Join our contact list:</h3>
                        <input 
                            placeholder="your email.."
                            value={contactEmail}
                            onChange={e => setContactEmail(e.target.value)}
                            type="email"
                        />
                        <input 
                            placeholder="your organisation.." 
                            value={contactOrg}
                            onChange={e => setContactOrg(e.target.value)}
                        />
                        <button 
                            style={{ "color": "#fff", "background": "black"}}
                            onClick={handleContactSubmit}
                        >
                            SUBMIT
                        </button>
                        {contactMsg && <p style={{ marginTop: 8, fontSize: "0.85rem" }}>{contactMsg}</p>}

                    <br />
                    <br />
                    <br />

                    <span className="info-col-label social-media">SOCIAL MEDIA.</span>

                    <div className="social-links">
                        {/* <a className="social-link" href="https://github.com/tateakasledgehammer" target="_blank" rel="noreferrer">
                            GitHub <i className="fa-brands fa-github" />
                        </a> */}
                        <a className="social-link" href="#" onClick={e => e.preventDefault()}>
                            Instagram <i className="fa-brands fa-instagram" />
                        </a>
                        <a className="social-link" href="#" onClick={e => e.preventDefault()}>
                            LinkedIn <i className="fa-brands fa-linkedin" />
                        </a>
                    </div>
                    
                    <br />
                    <br />
                    <br />

                </div>

                <div className="info-col">
                    <div id="info-sessions" className="event-section">
                    <span className="event-label">ATTEND AN INFO SESH.</span>
                    <p className="event-info">Email to join a group call to discuss how we can help you</p>
                    <div className="event-tier">
                        <div className="event-row">
                            <div>
                                <div className="event-name">Intro call (AEST)</div>
                                <div className="event-desc">MONDAYS 12PM</div>
                                <div className="event-desc">THURSDAYS 8AM</div>
                                <div className="event-desc">FRIDAYS 3PM</div>
                            </div>
                            {/* <div className="event-price">→</div> */}
                        </div>
                        <div className="event-row">
                            <div>
                                <div className="event-name">Team demo</div>
                                <div className="event-desc">CONTACT US</div>
                            </div>
                        </div>
                    </div>
                    </div>

                    <br />
                    <br />

                    <div className="shaded-section">
                        <span id="scoring-info" className="info-col-label">AI SCORING.</span>
                            <h3>Every study ranked before you read a word.</h3>
                        <p>
                            Every study receives a relevance score against your
                            criteria before screening begins. High scorers surface first.
                            Obvious rejects are flagged automatically.
                        </p>
                    </div>

                    <br />
                    <br />
                    <br />
                    
                    <h3 id="user-guide" className="user-guide-heading">USER GUIDE.</h3>
                    {/* Replace href with real PDF path when ready */}
                    <a className="download-btn" href="#how-it-works">
                        {/* <i className="fa-solid fa-file-pdf" />
                        Download PDF guide */}
                        <i class="fa-solid fa-diagram-next" />
                        See our process
                    </a>

                    <br />
                    <br />

                    {/* <p>
                        Download the full PDF guide covering project setup, AI scoring,
                        screening workflows, and export options. Suitable for sharing
                        with your team or institution ethics board.
                    </p> */}
                </div>

                <div className="info-col">
                    <span id="pricing-info" className="info-col-label">PRICING.</span>
                    <div className="pricing-tier">
                        <div className="pricing-row">
                            <div>
                                <div className="pricing-name">FREE</div>
                                <div className="pricing-desc">Solo researcher</div>
                                <div className="pricing-desc">Keyword-based scoring</div>
                            </div>
                            <div className="pricing-price">
                                $0
                            </div>
                        </div>
                        <div className="pricing-row">
                            <div>
                                <div className="pricing-name">ADVANCED</div>
                                <div className="pricing-desc">Solo with collaboration</div>
                                <div className="pricing-desc">AI-scoring enabled</div>
                            </div>
                            <div className="pricing-price">
                                $8.99
                                <small>/ mo</small>
                            </div>
                        </div>
                        <div className="pricing-row">
                            <div>
                                <div className="pricing-name">INSTITUTION</div>
                                <div className="pricing-desc">Full access</div>
                                <div className="pricing-desc">Priority support</div>
                            </div>
                            <div className="pricing-price">
                                CONTACT US!
                            </div>
                        </div>
                    </div>

                    <br />
                    <br />
                    <br />

                    <div className="big-stat">
                        80<span className="big-stat-unit">%</span>
                    </div>                    
                    <span className="info-col-label">TIME SAVING.</span>
                    <h4>^ Estimation based on a review where 97% of imports were irrelevant</h4>
                    <p className="big-stat-cap"> 
                        Systematic reviews average 12-18 months. Most of that 
                        is spent sifting through studies that never make it. Flyscreen
                        gives you predictive scores to get to the studies that matter faster.
                    </p>
                    <br />

                    <br />  
                    <br /> 
                    
                    <div className="shaded-section">
                    <span id="prisma-info" className="info-col-label">PRISMA READY.</span>
                    <p> 
                        Tracks your uploads, duplicates and votes for clarity in a PRISMA flow diagram.
                        Put your criteria and files in and we will handle the rest.
                    </p>
                    </div>
                   
                </div>

            </div>

            {/* ── PROCESS MAP ── */}
            <section className="process-section">
                <div id="how-it-works" className="process-section-inner">
                    <span className="process-eyebrow">A to Z | IMPORT TO ANALYSIS</span>
                    <h2 className="process-heading">How it works.</h2>
                    <div className="process-map">
                        <div className="process-step">
                            <div className="step-number">01</div>
                            <div className="step-title">Create project</div>
                            <p className="step-desc">
                                Define your criteria and drop in your inclusion and exclusion rules. 
                                Our system picks up your background information and uses it to review
                                every study.
                            </p>
                        </div>
                        <div className="process-step">
                            <div className="step-number">02</div>
                            <div className="step-title">Import studies</div>
                            <p className="step-desc">
                                Upload RIS files from any database: PubMed, Scopus, you name it.
                                Duplicates detected automatically.
                            </p>
                        </div>
                        <div className="process-step">
                            <div className="step-number">03</div>
                            <div className="step-title">Study Scoring</div>
                            <p className="step-desc">
                                We give you a relevance score for every study, so you can
                                skip the obvious and move into the studies that matter to you. No time wasting.
                            </p>
                        </div>
                        <div className="process-step">
                            <div className="step-number">04</div>
                            <div className="step-title">Screen & filter</div>
                            <p className="step-desc">
                                Flyscreen still has the classic tools to push your screening along.
                                Filters, tags, notes, highlights, and vote tracking all help your team to be efficient
                                and keep tabs on edge cases.
                            </p>
                        </div>
                        <div className="process-step">
                            <div className="step-number">05</div>
                            <div className="step-title">Full-text review</div>
                            <p className="step-desc">
                                Move accepted studies forward. Export your final list and get down to business.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── AUTH ── */}
            <section className="landing-auth-section">
                <p className="landing-auth-eyebrow">Get started</p>
                <h2 className="landing-auth-heading">Jump in.</h2>
                <Authentication
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                    setUser={setUser}
                />
            </section>

            <footer className="landing-footer">

            {/* Top link grid */}
            <div className="footer-grid">
                <div className="footer-col">
                    <span className="footer-col-head">Product</span>
                    <a href="#how-it-works">How it works</a>
                    <a href="#pricing-info">Pricing</a>
                    <a href="#scoring-info">AI Scoring</a>
                    <a href="#prisma-info">PRISMA export</a>
                </div>
                <div className="footer-col">
                    <span className="footer-col-head">Resources</span>
                    <a href="#how-it-works">User guide</a>
                    <a href="#info-sessions">Info sessions</a>
                    <a href="#contact-us">Contact us</a>
                </div>
                <div className="footer-col">
                    <span className="footer-col-head">Connect</span>
                    {/* <a href="https://github.com/tateakasledgehammer" target="_blank" rel="noreferrer">GitHub</a> */}
                    <a href="#" onClick={e => e.preventDefault()}>Instagram</a>
                    <a href="#" onClick={e => e.preventDefault()}>LinkedIn</a>
                </div>

                {/* Sign up box */}
                <div className="footer-signup">
                    <span className="footer-col-head">Stay in the loop</span>
                    <input 
                        className="footer-input" 
                        type="email" 
                        placeholder="your@email.edu"
                        value={footerEmail}
                        onChange={e => setFooterEmail(e.target.value)}
                    />
                    <button onClick={handleFooterSubscribe} className="footer-subscribe-btn">Subscribe</button>
                    {footerMsg && <p style={{ color: "var(--accent)", fontSize: "0.8rem", marginTop: 4 }}>{footerMsg}</p>}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="footer-bottom">
                <span className="footer-brand">FLYSCREEN ACADEMICS.</span>
                <div className="footer-legal">
                    <a href="/privacy" onClick={e => {
                        // e.preventDefault();
                        // alert("For information about our policy, please contact us at hello@flyscreenacademics.com.au. A full policy document is in preparation");
                    }}
                    >
                        Privacy Policy
                    </a>
                    <a href="/privacy" onClick={e => {
                        // e.preventDefault();
                        // alert("For information about our terms, please contact us at hello@flyscreenacademics.com.au. A full policy document is in preparation");
                    }}
                    >
                        Terms of Use
                    </a>
                    <a href="/privacy" onClick={e => {
                        // e.preventDefault();
                        // alert("Your data is stored on Australian servers. Study titles and abstracts sent for AI scoring are not retained after scoring is complete. Contact hello@flyscreenacademics.com.au for a full data handling statement which is in preparation.");
                    }}
                    >
                        Data & Security
                    </a>
                    <span>© {new Date().getFullYear()} Flyscreen Academics</span>
                </div>
            </div>

        </footer>

        </div>
    );
}