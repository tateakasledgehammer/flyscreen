import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Authentication(props) {
    const { isAuthenticated, setIsAuthenticated, setUser } = props
    const navigate = useNavigate();

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [errors, setErrors] = useState([])

    const [loginNotSignUp, setLoginNotSignUp] = useState(true)

    function handleSetLogIn() {
        setLoginNotSignUp(true)
    }
    function handleSetSignUp() {
        setLoginNotSignUp(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setMessage("")

        const endpoint = loginNotSignUp ? "api/auth/login" : "api/auth/register";

        try {
            const res = await fetch(`http://localhost:5005/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, password })
            });
            
            const data = await res.json()

            if (!data.success) {
                setErrors(data.errors || ["Something went wrong"]);
                return;
            } 
            
            const whoamiRes = await fetch("http://localhost:5005/api/whoami", {
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

            navigate("/overview")

        }   catch (err) {
            console.error(err)
            setErrors(["Failed to connect"]);
        }
    };

    return (
        (!isAuthenticated && (
        <div className="page-container">
            <br />
            <hr />

            <h2><i className="fa-solid fa-right-to-bracket"></i> Authentication</h2>
            
            <button onClick={handleSetLogIn}>
                Log in
            </button>
            <button onClick={handleSetSignUp}>
                Sign up
            </button>

            {!loginNotSignUp && (
                <form id="loginorsignup" onSubmit={handleSubmit}>
                    <fieldset className="log-in">
                        <legend><strong>Create an account</strong></legend>
                        <label htmlFor="username">Username</label>
                        <input 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text" 
                            placeholder="enter your username..."
                            autoComplete="off"
                        />
                        <label htmlFor="password">Password</label>
                        <input 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" 
                            placeholder="enter your password..."
                            autoComplete="off" 
                        />
                        <br />
                        <button type="submit">Sign up</button>
                    </fieldset>
                </form>
            )}

            {loginNotSignUp && (
                <form onSubmit={handleSubmit}>
                    <fieldset className="log-in">
                        <legend><strong>Log in to your account</strong></legend>
                        <label htmlFor="username">Username</label>
                        <input 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text" 
                            placeholder="enter your username..."
                            autoComplete="off"
                        />
                        
                        <label htmlFor="password">Password</label>
                        <input 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="enter your password..."
                            autoComplete="off" 
                        />

                        <br />
                        <button type="submit">Log in</button>
                    </fieldset>
                </form>
            )}

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