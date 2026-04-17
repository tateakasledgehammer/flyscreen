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
                    <h3 className="media-col-heading">SCREEN SMARTER</h3>
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

                    <span className="info-col-label">HAVE QUESTIONS?</span>
                    <h3>Email us: </h3>
                        <p>hello@flyscreenacademics.com.au</p>
                    <h3>Call us: </h3>
                        <p>0438 496 326</p>
                    <h3>Join our contact list:</h3>
                        <input placeholder="your email.."/>
                        <input placeholder="your organisation.." />
                        <button style={{ "color": "#fff", "background": "black"}}>SUBMIT</button>

                    <br />
                    <br />
                    <br />

                    <span className="info-col-label">SOCIAL MEDIA.</span>

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
                    <span className="info-col-label">ATTEND AN INFO SESH.</span>
                    <h3>
                        Join a group call to discuss your processes and how we can help
                    </h3>

                    <br />
                    <br />

                    <span className="info-col-label">AI SCORING.</span>
                        <h3>Studies get ranked before you read a word.</h3>
                    <p>
                        Every study receives a <strong>relevance score</strong> against your
                        criteria before screening begins. High scorers surface first.
                        Obvious rejects are batched away automatically.
                    </p>

                    <br />
                    <br />
                    <br />
                    
                    <h3 className="media-col-heading">USER GUIDE.</h3>
                    {/* Replace href with real PDF path when ready */}
                    <a className="download-btn" href="#" onClick={e => e.preventDefault()}>
                        <i className="fa-solid fa-file-pdf" />
                        Download PDF guide
                    </a>
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
                                <div className="pricing-name">Free</div>
                                <div className="pricing-desc">Solo researcher, up to 500 studies</div>
                            </div>
                            <div className="pricing-price">
                                $0
                            </div>
                        </div>
                        <div className="pricing-row">
                            <div>
                                <div className="pricing-name">Team</div>
                                <div className="pricing-desc">Up to 5 reviewers, unlimited studies</div>
                            </div>
                            <div className="pricing-price">
                                $29
                                <small>/ mo</small>
                            </div>
                        </div>
                        <div className="pricing-row">
                            <div>
                                <div className="pricing-name">Institution</div>
                                <div className="pricing-desc">Unlimited seats, priority support</div>
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
                </div>

            </div>

            {/* ── PROCESS MAP ── */}
            <section className="process-section">
                <div className="process-section-inner">
                    <span className="process-eyebrow">A-Z</span>
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
                            <div className="step-title">AI scoring</div>
                            <p className="step-desc">
                                We give you a relevance score for <strong>every</strong>study, so you can
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

            {/* ── FOOTER ── */}
            <footer className="landing-footer">
                <span className="footer-brand">FLYSCREEN ACADEMICS</span>
                <span className="footer-copy">
                    © {new Date().getFullYear()} — developed by{" "}
                    <a href="https://github.com/tateakasledgehammer" target="_blank" rel="noreferrer">
                        tateakasledgehammer
                    </a>
                </span>
            </footer>

        </div>
    );
}