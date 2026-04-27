import { useState, useEffect, useRef } from "react";

export default function Prisma({ projectId, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const diagramRef = useRef(null);

    useEffect(() => {
        async function fetchAll() {
            try {
                const [progressRes, duplicatesRes, reasonsRes] = await Promise.all([
                    fetch(`/api/projects/${projectId}/progress`, { credentials: "include" }),
                    fetch(`/api/projects/${projectId}/duplicates/count`, { credentials: "include" }),
                    fetch(`/api/projects/${projectId}/exclusion-reasons/breakdown`, { credentials: "include" }),
                ]);

                const progress   = await progressRes.json();
                const duplicates = await duplicatesRes.json();
                const reasons    = await reasonsRes.json();

                setData({ progress, duplicates: duplicates.count, reasons });
            } catch (err) {
                console.error("PRISMA data fetch failed:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, [projectId]);

    async function handleExportPNG() {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(diagramRef.current, {
            backgroundColor: "#ffffff",
            scale: 2,
        });
        const link = document.createElement("a");
        link.download = `prisma_flow_diagram_${new Date().toISOString().split("T")[0]}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }

    if (loading) return (
        <Overlay onClose={onClose}>
            <p style={{ padding: 40 }}>Loading PRISMA data...</p>
        </Overlay>
    );

    if (!data) return (
        <Overlay onClose={onClose}>
            <p style={{ padding: 40 }}>Failed to load data.</p>
        </Overlay>
    );

    const { progress, duplicates, reasons } = data;

    // ── PRISMA COUNTS ─────────────────────────────────────────
    const totalIdentified   = progress.totalStudies + duplicates;
    const afterDuplicates   = progress.totalStudies;
    const taScreened        = progress.totalStudies;
    const taExcluded        = progress.ta.rejected;
    const ftAssessed        = progress.ta.accepted;
    const ftExcluded        = progress.ft.rejected;
    const finalIncluded     = progress.ft.accepted;

    return (
        <Overlay onClose={onClose}>
            <div style={{
                background: "#fff",
                borderRadius: 6,
                padding: "32px 36px",
                maxWidth: 780,
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
            }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                    <div>
                        <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.8rem", letterSpacing: "0.04em" }}>
                            PRISMA FLOW DIAGRAM
                        </h2>
                        <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                            Based on current screening data
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={handleExportPNG} style={{ background: "var(--ink)", color: "#fff", border: "none", padding: "8px 16px", cursor: "pointer", fontSize: "0.82rem" }}>
                            Download PNG
                        </button>
                        <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--border)", padding: "8px 14px", cursor: "pointer", fontSize: "0.82rem" }}>
                            Close
                        </button>
                    </div>
                </div>

                {/* ── DIAGRAM ── */}
                <div ref={diagramRef} style={{
                    background: "#fff",
                    padding: "24px 16px",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                }}>

                    {/* ── IDENTIFICATION ── */}
                    <PhaseLabel label="Identification" />
                    <div style={ROW}>
                        <Box label="Records identified through database search" n={totalIdentified} />
                        <Spacer />
                        <Box label="Duplicate records removed" n={duplicates} faded />
                    </div>
                    <DownArrow center />

                    <Box label="Records after duplicates removed" n={afterDuplicates} wide />
                    <DownArrow center />

                    {/* ── SCREENING ── */}
                    <PhaseLabel label="Screening" />
                    <div style={ROW}>
                        <Box label="Records screened" n={taScreened} />
                        <RightArrow />
                        <Box label="Records excluded at title/abstract" n={taExcluded} faded />
                    </div>
                    <DownArrow left />

                    {/* ── ELIGIBILITY ── */}
                    <PhaseLabel label="Eligibility" />
                    <div style={ROW}>
                        <Box label="Full-text articles assessed for eligibility" n={ftAssessed} />
                        <RightArrow />
                        <div style={{ flex: 1 }}>
                            <Box label="Full-text articles excluded" n={ftExcluded} faded />
                            {reasons.length > 0 && (
                                <div style={{
                                    border: "1px solid #ccc",
                                    padding: "8px 12px",
                                    marginTop: 4,
                                    fontSize: "0.75rem",
                                    color: "#444",
                                    background: "#fafafa"
                                }}>
                                    {reasons.map(r => (
                                        <div key={r.reason} style={{ marginBottom: 2 }}>
                                            {r.reason} (n={r.count})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <DownArrow left />

                    {/* ── INCLUDED ── */}
                    <PhaseLabel label="Included" />
                    <Box label="Studies included in review" n={finalIncluded} wide highlight />

                </div>
                {/* end diagram */}

            </div>
        </Overlay>
    );
}

// ── SUB-COMPONENTS ────────────────────────────────────────────

function Overlay({ children, onClose }) {
    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000,
                padding: 20,
            }}
        >
            <div onClick={e => e.stopPropagation()} style={{ width: "100%" }}>
                {children}
            </div>
        </div>
    );
}

function PhaseLabel({ label }) {
    return (
        <div style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#6B7A8D",
            borderLeft: "3px solid #1A2535",
            paddingLeft: 8,
            marginBottom: 8,
            marginTop: 16,
        }}>
            {label}
        </div>
    );
}

function Box({ label, n, faded, wide, highlight }) {
    return (
        <div style={{
            border: highlight ? "2.5px solid #1A2535" : "1.5px solid #aaa",
            padding: "10px 14px",
            textAlign: "center",
            background: faded ? "#f8f8f8" : highlight ? "#F5F0E8" : "#fff",
            flex: wide ? "none" : 1,
            width: wide ? "50%" : undefined,
            margin: wide ? "0 auto" : undefined,
            fontSize: "0.78rem",
            color: "#222",
            lineHeight: 1.4,
        }}>
            <div>{label}</div>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", marginTop: 4 }}>
                (n = {n.toLocaleString()})
            </div>
        </div>
    );
}

function DownArrow({ center, left }) {
    return (
        <div style={{
            display: "flex",
            justifyContent: left ? "flex-start" : "center",
            paddingLeft: left ? "calc(25% - 8px)" : 0,
            color: "#555",
            fontSize: "1.2rem",
            lineHeight: 1,
            margin: "4px 0",
        }}>
            ↓
        </div>
    );
}

function RightArrow() {
    return (
        <div style={{ display: "flex", alignItems: "center", padding: "0 8px", color: "#555", fontSize: "1.1rem" }}>
            →
        </div>
    );
}

function Spacer() {
    return <div style={{ flex: 1 }} />;
}

const ROW = {
    display: "flex",
    alignItems: "flex-start",
    gap: 4,
};