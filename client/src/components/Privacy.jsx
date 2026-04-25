export default function Privacy() {
    return (
        <div style={{
            background: "rgb(255, 255, 255)",
            minHeight: "100vh",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            color: "#111"
        }}>

            {/* ── HEADER ── */}
            <div style={{
                background: "#111",
                borderBottom: "3px solid #FFF047",
                padding: "0 32px",
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <a href="/"
                style={{
                    fontFamily: "'Staatliches', 'Impact', sans-serif",
                    fontSize: "1.8rem",
                    letterSpacing: "0.01em",
                    color: "#fff"
                }}>
                    RETURN TO FLYSCREEN ACADEMICS.
                </a>
            </div>

            {/* ── HERO BAND ── */}
            <div style={{
                background: "#111",
                padding: "48px 64px 40px",
                borderBottom: "2px solid #FFF047"
            }}>
                {/* <p style={{
                    fontFamily: "'Staatliches', 'Impact', sans-serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#FFF047",
                    marginBottom: 10
                }}>
                    Legal
                </p> */}
                <h1 style={{
                    fontFamily: "'Staatliches', 'Impact', sans-serif",
                    fontSize: "clamp(3rem, 7vw, 5.5rem)",
                    lineHeight: 0.9,
                    color: "#fff",
                    textTransform: "uppercase",
                    marginBottom: 16,
                }}>
                    Privacy, Data<br />& Security.
                </h1>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", maxWidth: 560, lineHeight: 1.7 }}>
                    This document explains what data Flyscreen Academics collects, how it is used,
                    where it is stored, and how you can contact us with questions or requests.
                    Last updated: April 2026.
                </p>
            </div>

            {/* ── CONTENT ── */}
            <div style={{ maxWidth: 860, margin: "0 auto", padding: "64px 40px 100px" }}>

                {/* Quick summary boxes */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 12,
                    marginBottom: 60
                }}>
                    {[
                        [<i class="fa-solid fa-earth-asia" />, "Australian servers", "All data is stored on servers located in Australia."],
                        [<i class="fa-solid fa-user" />, "Your data, your control", "You can request deletion of your account and all associated data at any time."],
                        [<i class="fa-solid fa-envelopes-bulk" />, "Direct contact", "Privacy questions come in directly — no support queue."],
                    ].map(([icon, title, body]) => (
                        <div key={title} style={{
                            background: "#fff",
                            border: "4px solid #111",
                            padding: "20px 18px"
                        }}>
                            <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>{icon}</div>
                            <div style={{
                                fontFamily: "'Staatliches', 'Impact', sans-serif",
                                fontSize: "1.1rem",
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                                marginBottom: 6
                            }}>
                                {title}
                            </div>
                            <p style={{ fontSize: "0.82rem", color: "#6B7A8D", lineHeight: 1.6, margin: 0 }}>
                                {body}
                            </p>
                        </div>
                    ))}
                </div>

                <Section title="1. Who we are">
                    <P>
                        Flyscreen Academics is a systematic review screening tool developed by Tate Williams,
                        an honours researcher at an Australian university. The tool is operated as a small
                        independent product. For all privacy-related enquiries, contact us directly at{" "}
                        <a href="mailto:hello@flyscreenacademics.com.au" style={{ color: "#111", fontWeight: 500 }}>
                            hello@flyscreenacademics.com.au
                        </a>.
                    </P>
                </Section>

                <Section title="2. What data we collect">
                    <P>We collect the minimum data necessary to operate the service.</P>
                    <Subsection title="Account data">
                        <ul style={{ paddingLeft: 20, lineHeight: 2, fontSize: "0.88rem", color: "#444" }}>
                            <li>Username (required)</li>
                            <li>Password (stored as a bcrypt hash — we never store your plaintext password)</li>
                            <li>Email address (optional — used only for account recovery and product updates)</li>
                            <li>Account creation date</li>
                            <li>Subscription plan (free, advanced, or institution)</li>
                        </ul>
                    </Subsection>
                    <Subsection title="Project and review data">
                        <ul style={{ paddingLeft: 20, lineHeight: 2, fontSize: "0.88rem", color: "#444" }}>
                            <li>Project names and background information you enter</li>
                            <li>Inclusion and exclusion criteria you define</li>
                            <li>Study records imported via RIS files (title, abstract, authors, year, DOI, keywords)</li>
                            <li>Screening decisions (accept/reject votes, reasons, notes)</li>
                            <li>Tags and filter terms you create</li>
                        </ul>
                    </Subsection>
                    <Subsection title="Usage data">
                        <ul style={{ paddingLeft: 20, lineHeight: 2, fontSize: "0.88rem", color: "#444" }}>
                            <li>Session tokens (stored in a secure HTTP-only cookie, expires after 24 hours)</li>
                            <li>Server-side logs (standard access logs for debugging and security monitoring)</li>
                        </ul>
                    </Subsection>
                    <Subsection title="Contact list (optional)">
                        <P>
                            If you submit your email via the landing page contact form or the "stay in the loop"
                            footer form, we store your email address and organisation name. This list is used only
                            to send product updates and never shared with third parties. You can ask to be removed
                            at any time by emailing us.
                        </P>
                    </Subsection>
                </Section>

                <Section title="3. How we use your data">
                    <P>Your data is used solely to provide the Flyscreen Academics service. Specifically:</P>
                    <ul style={{ paddingLeft: 20, lineHeight: 2, fontSize: "0.88rem", color: "#444" }}>
                        <li>Account data is used to authenticate you and manage your subscription.</li>
                        <li>Project data is used to run the screening tool and store your review progress.</li>
                        <li>Study records are used to display, filter, and score your imported studies.</li>
                        <li>Screening decisions are stored so your team can track review progress and resolve conflicts.</li>
                    </ul>
                    <P>
                        We do not sell your data. We do not use your data for advertising. We do not share
                        your data with third parties except as described in Section 4 (AI scoring).
                    </P>
                </Section>

                <Section title="4. AI scoring and third-party processing">
                    <div style={{
                        background: "#FFF047",
                        border: "4px solid #111",
                        padding: "20px 24px",
                        marginBottom: 20
                    }}>
                        <p style={{ fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>
                            Important: study abstracts sent for AI scoring are transmitted to Open API
                            for processing. They are not retained by Flyscreen after scoring completes,
                            and are not used to train AI models.
                        </p>
                    </div>
                    <P>
                        When AI scoring is enabled on a project, the study title, abstract, and your project's
                        background and criteria are sent to the Open API to generate a relevance score and
                        brief explanation. This is the only point at which study content leaves our servers.
                    </P>
                    <P>
                        OpenAI's data handling for API calls is governed by their API usage policy, which
                        includes commitments that API inputs are not used to train their models. For full details
                        see their site.
                    </P>
                    <P>
                        If you are working with unpublished or sensitive research data, we recommend using
                        keyword-based scoring only (available on the free plan), which does not send any
                        content to external services.
                    </P>
                    <Subsection title="What is sent to the AI">
                        <ul style={{ paddingLeft: 20, lineHeight: 2, fontSize: "0.88rem", color: "#444" }}>
                            <li>Study title</li>
                            <li>Study abstract</li>
                            <li>Your project background text</li>
                            <li>Your inclusion and exclusion criteria</li>
                        </ul>
                    </Subsection>
                    <Subsection title="What is NOT sent to the AI">
                        <ul style={{ paddingLeft: 20, lineHeight: 2, fontSize: "0.88rem", color: "#444" }}>
                            <li>Your username or account details</li>
                            <li>Your screening decisions or notes</li>
                            <li>Full-text documents</li>
                            <li>Any other user data</li>
                        </ul>
                    </Subsection>
                </Section>

                <Section title="5. Data storage and security">
                    <Subsection title="Where your data is stored">
                        <P>
                            All user data — accounts, projects, studies, screening decisions — is stored in a
                            SQLite database on servers located in Australia. We do not use overseas cloud storage
                            for your research data.
                        </P>
                    </Subsection>
                    <Subsection title="Security measures">
                        <ul style={{ paddingLeft: 20, lineHeight: 2, fontSize: "0.88rem", color: "#444" }}>
                            <li>Passwords are hashed using bcrypt (salted, never stored in plaintext)</li>
                            <li>Sessions are managed via HTTP-only, Secure, SameSite=Strict JWT cookies</li>
                            <li>Invalidated tokens are tracked in a denylist and cleaned up hourly</li>
                            <li>Login and registration endpoints are rate-limited to prevent brute-force attacks</li>
                            <li>All traffic is served over HTTPS</li>
                            <li>Environment secrets (JWT secret, API keys) are stored in environment variables and never committed to version control</li>
                        </ul>
                    </Subsection>
                    <Subsection title="Data retention">
                        <P>
                            Your account data and project data are retained for as long as your account is active.
                            If you delete a project, all associated studies, screening decisions, notes, and tags
                            are permanently deleted. If you close your account, all your data is deleted from our
                            systems within 30 days of your request.
                        </P>
                    </Subsection>
                </Section>

                <Section title="6. Your rights">
                    <P>You have the right to:</P>
                    <ul style={{ paddingLeft: 20, lineHeight: 2, fontSize: "0.88rem", color: "#444" }}>
                        <li><strong>Access</strong> — request a copy of the data we hold about you</li>
                        <li><strong>Correction</strong> — update your email address or username via your account dashboard</li>
                        <li><strong>Deletion</strong> — request deletion of your account and all associated data</li>
                        <li><strong>Opt out</strong> — unsubscribe from our contact list at any time</li>
                        <li><strong>Portability</strong> — export your included studies and screening decisions at any time from within the app</li>
                    </ul>
                    <P>
                        To exercise any of these rights, email{" "}
                        <a href="mailto:hello@flyscreenacademics.com.au" style={{ color: "#111", fontWeight: 500 }}>
                            hello@flyscreenacademics.com.au
                        </a>. We will respond within 5 business days.
                    </P>
                </Section>

                <Section title="7. Cookies">
                    <P>
                        We use one cookie: <code style={{ background: "#EDEAE2", padding: "1px 5px", borderRadius: 3 }}>flyscreenCookie</code>.
                        This is an HTTP-only authentication cookie that expires after 24 hours. It does not track
                        you across sites, is not used for advertising, and is not accessible to JavaScript running
                        in the browser. We do not use analytics cookies, marketing cookies, or third-party tracking.
                    </P>
                </Section>

                <Section title="8. Institutional use">
                    <P>
                        If you are using Flyscreen Academics under an institution plan or are evaluating it for
                        institutional adoption, we are happy to provide a data processing agreement (DPA) or
                        answer specific questions from your institution's IT or legal team. Contact us at{" "}
                        <a href="mailto:hello@flyscreenacademics.com.au" style={{ color: "#111", fontWeight: 500 }}>
                            hello@flyscreenacademics.com.au
                        </a>.
                    </P>
                    <P>
                        For institutions requiring that no study data leave Australian servers under any
                        circumstances, keyword-based scoring is available on all plans and does not transmit
                        any content externally.
                    </P>
                </Section>

                <Section title="9. Changes to this policy">
                    <P>
                        If we make material changes to this policy — particularly around how study data is
                        processed — we will notify registered users by email (if an email address is on file)
                        and update the "last updated" date at the top of this page. Continued use of the
                        service after changes constitutes acceptance of the updated policy.
                    </P>
                </Section>

                <Section title="10. Contact">
                    <div style={{
                        background: "#111",
                        padding: "28px 32px",
                        marginTop: 12
                    }}>
                        <p style={{
                            fontFamily: "'Staatliches', 'Impact', sans-serif",
                            fontSize: "1.2rem",
                            letterSpacing: "0.06em",
                            color: "#FFF047",
                            textTransform: "uppercase",
                            marginBottom: 12
                        }}>
                            Privacy questions
                        </p>
                        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: 8 }}>
                            Email: <a href="mailto:hello@flyscreenacademics.com.au" style={{ color: "#FFF047" }}>
                                hello@flyscreenacademics.com.au
                            </a>
                        </p>
                        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem", lineHeight: 1.7, margin: 0 }}>
                            We are a small team and your message will be read by the founder directly.
                            We aim to respond to all privacy enquiries within 5 business days.
                        </p>
                    </div>
                </Section>

            </div>

            {/* ── FOOTER ── */}
            <div style={{
                background: "#111",
                borderTop: "3px solid #FFF047",
                padding: "24px 40px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12
            }}>
                <span style={{
                    fontFamily: "'Staatliches', 'Impact', sans-serif",
                    fontSize: "1.1rem",
                    letterSpacing: "0.12em",
                    color: "rgba(255,255,255,0.5)"
                }}>
                    FLYSCREEN ACADEMICS.
                </span>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>
                    © {new Date().getFullYear()} Flyscreen Academics — hello@flyscreenacademics.com.au
                </span>
            </div>

        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: 48 }}>
            <h2 style={{
                fontFamily: "'Staatliches', 'Impact', sans-serif",
                fontSize: "1.8rem",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                color: "#111",
                marginBottom: 6,
                lineHeight: 0.95,
                borderBottom: "4px solid #111",
                paddingBottom: 8
            }}>
                {title}
            </h2>
            <div style={{ marginTop: 16 }}>
                {children}
            </div>
        </div>
    );
}

function Subsection({ title, children }) {
    return (
        <div style={{ marginTop: 16, marginBottom: 8 }}>
            <h3 style={{
                fontFamily: "'Staatliches', 'Impact', sans-serif",
                fontSize: "1.1rem",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#111",
                marginBottom: 6
            }}>
                {title}
            </h3>
            {children}
        </div>
    );
}

function P({ children }) {
    return (
        <p style={{
            fontSize: "0.88rem",
            lineHeight: 1.78,
            color: "#444",
            marginBottom: 12,
            fontWeight: 400
        }}>
            {children}
        </p>
    );
}