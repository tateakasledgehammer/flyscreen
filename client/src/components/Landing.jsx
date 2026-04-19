import Authentication from "./Authentication";
import "../landing.css";

export default function Landing({ isAuthenticated, setIsAuthenticated, setUser }) {
    return (
        <div className="landing-page">

            {/* ── STICKY CENTRED HEADER — Urban Climb style ── */}
            <div className="landing-header">
                <div className="landing-header-inner">
                    FLYSCREEN ACADEMICS.
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
                    {/*
                        Replace placeholder with:
                        <iframe
                        src="https://www.youtube.com/embed/YOUR_ID"
                        title="Flyscreen demo"
                        allowFullScreen
                        />
                    */}
                    <div className="video-placeholder">
                        <i className="fa-regular fa-circle-play" />
                        <h2>DEMO COMING SOON</h2>
                    </div>
                </div>
                <p>
                AI-powered systematic review screening for research teams to
                cut months of work down to weeks.
                </p>
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

                    <span className="info-col-label">WHO WHAT WHEN WHERE WHY.</span>
                    <h3>Stop wasting time on studies that never stood a chance. Get to the nitty-gritty fast.</h3>
                    <p>
                        In doing a systematic review as part of my honours course, last year,
                        my team of in-demand academics found it difficult to navigate
                        the demands of a role in the university with the grind of screening
                        studies. 
                    </p>
                    <br />
                    <p>
                        Speaking to other students, it became clear that traditional processes around
                        secondary research are a drag that detracts from the real work and is stopping
                        many from going further into research. Our system puts all the key info front
                        and centre, so that your team can quickly identify what meets your criteria and
                        what does not. We have two models: a keyword-based system that searches
                        for words in your criteria to score imports, and an AI-based system that scans
                        content and gives you feedback for every article. Either way you will have more
                        time doing the valuable work
                    </p>
                    <br />
                    <p>
                        We want to make it easier for staff and students to do meaningful work
                        instead of wasting time wading through studies that never stood a chance.
                    </p>
                    <br />

                    <br />

                    <span className="info-col-label">HAVE QUESTIONS?</span>
                    <h3>Email us: </h3>
                        <p>hello@flyscreenacademics.com.au</p>
                    <br />
                    {/* <h3>Call us: </h3>
                        <p>0412 345 678</p> */}
                    <h3>Join our contact list:</h3>
                        <input placeholder="your email.."/>
                        <input placeholder="your organisation.." />
                        <button style={{ "color": "#fff", "background": "black"}}>SUBMIT</button>

                    <br />
                    <br />
                    <br />

                    <span className="info-col-label social-media">SOCIAL MEDIA.</span>

                    <div className="social-links">
                        <a className="social-link" href="https://github.com/tateakasledgehammer" target="_blank" rel="noreferrer">
                            GitHub <i className="fa-brands fa-github" />
                        </a>
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
                    <div className="event-section">
                    <span className="event-label">ATTEND AN INFO SESH.</span>
                    <p className="event-info">Join a group call to discuss how we can help you</p>
                    <div className="event-tier">
                        <div className="event-row">
                            <div>
                                <div className="event-name">Intro call (AEST)</div>
                                <div className="event-desc">MONDAYS 12PM</div>
                                <div className="event-desc">THURSDAYS 8AM</div>
                                <div className="event-desc">FRIDAYS 3PM</div>
                            </div>
                            <div className="event-price">→</div>
                        </div>
                        <div className="event-row">
                            <div>
                                <div className="event-name">Team demo</div>
                                <div className="event-desc">EMAIL US</div>
                            </div>
                        </div>
                    </div>
                    </div>

                    <br />
                    <br />

                    <div className="shaded-section">
                        <span className="info-col-label">AI SCORING.</span>
                            <h3>We rank studies before you read a word.</h3>
                        <p>
                            Every study receives a <strong>relevance score</strong> against your
                            criteria before screening begins. High scorers surface first.
                            Obvious rejects are marked automatically.
                        </p>
                    </div>

                    <br />
                    <br />
                    <br />
                    
                    <h3 className="user-guide-heading">USER GUIDE.</h3>
                    {/* Replace href with real PDF path when ready */}
                    <a className="download-btn" href="#" onClick={e => e.preventDefault()}>
                        <i className="fa-solid fa-file-pdf" />
                        Download PDF guide
                    </a>

                    <br />
                    <br />

                    <p>
                        Download the full PDF guide covering project setup, AI scoring,
                        screening workflows, and export options. Suitable for sharing
                        with your team or institution ethics board.
                    </p>
                </div>

                <div className="info-col">
                    <span className="info-col-label">PRICING.</span>
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
                    <p className="big-stat-cap"> 
                        Systematic reviews average 12-18 months and most of that 
                        is sifting through studies that never make it. Flyscreen
                        gives you predictive scores to speed up this process so
                        you can spend more time on real analysis.
                    </p>

                    <br />  
                    <br /> 
                    
                    <div className="shaded-section">
                    <span className="info-col-label">PRISMA READY.</span>
                    <p> 
                        Tracks your uploads, duplicates and votes for clarity in a PRISMA flow diagram.
                        Put your crtieria and files in and we will handle the rest.
                    </p>
                    </div>
                   
                </div>

            </div>

            {/* ── PROCESS MAP ── */}
            <section className="process-section">
                <div className="process-section-inner">
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
                                Upload a RIS file from any database: PubMed, Scopus, you name it.
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
                                We are still equipped with all the classic tools to push your screening along.
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
                    <a href="#" onClick={e => e.preventDefault()}>How it works</a>
                    <a href="#" onClick={e => e.preventDefault()}>Pricing</a>
                    <a href="#" onClick={e => e.preventDefault()}>AI Scoring</a>
                    <a href="#" onClick={e => e.preventDefault()}>PRISMA export</a>
                </div>
                <div className="footer-col">
                    <span className="footer-col-head">Resources</span>
                    <a href="#" onClick={e => e.preventDefault()}>User guide (PDF)</a>
                    <a href="#" onClick={e => e.preventDefault()}>Info sessions</a>
                    <a href="#" onClick={e => e.preventDefault()}>Contact us</a>
                </div>
                <div className="footer-col">
                    <span className="footer-col-head">Connect</span>
                    <a href="https://github.com/tateakasledgehammer" target="_blank" rel="noreferrer">GitHub</a>
                    <a href="#" onClick={e => e.preventDefault()}>Instagram</a>
                    <a href="#" onClick={e => e.preventDefault()}>LinkedIn</a>
                </div>

                {/* Sign up box */}
                <div className="footer-signup">
                    <span className="footer-col-head">Stay in the loop</span>
                    <input className="footer-input" type="email" placeholder="your@email.edu" />
                    <button className="footer-subscribe-btn">Subscribe</button>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="footer-bottom">
                <span className="footer-brand">FLYSCREEN ACADEMICS.</span>
                <div className="footer-legal">
                    <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
                    <a href="#" onClick={e => e.preventDefault()}>Terms of Use</a>
                    <a href="#" onClick={e => e.preventDefault()}>Data & Security</a>
                    <span>© {new Date().getFullYear()} Flyscreen Academics</span>
                </div>
            </div>

        </footer>

        </div>
    );
}