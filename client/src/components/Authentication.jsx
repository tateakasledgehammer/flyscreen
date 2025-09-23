import { useState, useEffect } from "react"

export default function Authentication() {
    const [usernameInput, setUsernameInput] = useState("")
    const [passwordInput, setPasswordInput] = useState("")
    const [message, setMessage] = useState("")
    const [errors, setErrors] = useState([])

    const [loginNotSignUp, setLoginNotSignUp] = useState(true)

    const onFinish = values => (
        console.log('x')
    )

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

        const endpoint = loginNotSignUp ? "login" : "authentication";

        try {
            const res = await fetch(`http://localhost:5005/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ 
                    username: usernameInput, 
                    password: passwordInput 
                })
            });
            
            const data = await res.json()

            if (!data.success) {
                setErrors(data.errors || ["Something went wrong"])
            } else {
                setMessage(data.message)
            }
        }   catch (err) {
            setErrors(["Failed to connect"]);
        }
    };

    return (
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
                <form onSubmit={handleSubmit}>
                    <fieldset className="log-in">
                        <legend><strong>Create an account</strong></legend>
                        <label htmlFor="username">Username</label>
                        <input 
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            type="text" 
                            id="username" 
                            name="username"
                            placeholder="enter your username..."
                            autoComplete="off"
                        />
                        <label htmlFor="password">Password</label>
                        <input 
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            type="password" 
                            id="password" 
                            name="password" 
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
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            type="text" 
                            id="username" 
                            name="username"
                            placeholder="enter your username..."
                            autoComplete="off"
                        />
                        
                        <label htmlFor="password">Password</label>
                        <input 
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            type="password" 
                            id="password" 
                            name="password" 
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
                        <li key={i} style={{ color: "red" }}>
                            {err}
                        </li>
                    ))}
                </ul>
            )}

            {message && <p style={{ color: "green" }}>{message}</p>}
        </div>
    )
}