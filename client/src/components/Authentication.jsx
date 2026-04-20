import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Authentication(props) {
    const { isAuthenticated, setIsAuthenticated, setUser } = props
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);
    const [loginNotSignUp, setLoginNotSignUp] = useState(true);
    const [loading, setLoading] = useState(false);

    function handleSetLogIn() {
        setLoginNotSignUp(true)
    }
    function handleSetSignUp() {
        setLoginNotSignUp(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors([]);
        setMessage("")

        const endpoint = loginNotSignUp ? "auth/login" : "auth/register";

        try {
            const res = await fetch(`/api/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, password, email })
            });
            
            const data = await res.json()

            if (!data.success) {
                setErrors(data.errors || ["Something went wrong"]);
                setPassword("");
                return;
            } 
            
            const whoamiRes = await fetch("/api/auth/whoami", {
                credentials: "include"
            });
            if (whoamiRes.ok) {
                const whoamiData = await whoamiRes.json();
                setIsAuthenticated(Boolean(whoamiData.isAuthenticated));
                setUser(whoamiData.user || null)
            } else {
                setIsAuthenticated(true);
                setUser({ username });
            }

            setMessage(data.message || "Success")

            navigate("/dashboard")

        } catch (err) {
            console.error(err)
            setErrors(["Failed to connect"]);
        } finally {
            setLoading(false);
        }
    };

    return (
        (!isAuthenticated && (
        <div className="auth-card">
            <br />
            <hr />

            <h2><i className="fa-solid fa-right-to-bracket"></i> Authentication</h2>
            
            <div className="auth-tabs">
                <button className={`auth-tab ${loginNotSignUp ? "active" : ""}`} onClick={handleSetLogIn}>
                    Log in
                </button>
                <button className={`auth-tab ${loginNotSignUp ? "active" : ""}`} onClick={handleSetSignUp}>
                    Sign up
                </button>
            </div>
            
            <form onSubmit={handleSubmit}>
                <legend><strong>
                    {loginNotSignUp ? "Log in to your account" : "Create an account"}
                </strong></legend>
                <label className="auth-label" htmlFor="username">Username</label>
                <input 
                    value={username}
                    className="auth-input"
                    onChange={(e) => setUsername(e.target.value)}
                    type="text" 
                    placeholder="enter your username..."
                    autoComplete="on"
                />

                {!loginNotSignUp && (
                    <>
                    <label className="auth-label" htmlFor="email">Email (optional)</label>
                    <input
                        value={email}
                        className="auth-input"
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="you@email.edu"
                        autoComplete="email"
                    />
                    </>
                )}
                
                <label className="auth-label" htmlFor="password">Password</label>
                <input 
                    value={password}
                    className="auth-input"
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="enter your password..."
                    autoComplete="on" 
                />

                <br />
                <button className="auth-submit" disabled={loading} type="submit">
                    {loginNotSignUp ? "Log in" : "Sign up"}
                </button>
            </form>

            {errors.length > 0 && (
                <ul style={{ color: "red" }}>
                    {errors.map((err, i) => (
                        <li key={i}>{err}</li>
                    ))}
                </ul>
            )}

            {message && <p style={{ color: "green" }}>{message}</p>}
        </div>
        )
    ));
}