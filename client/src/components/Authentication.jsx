import { useState, useEffect } from "react"

export default function Authentication() {
    const [usernameInput, setUsernameInput] = useState("")
    const [passwordInput, setPasswordInput] = useState("")
    const [message, setMessage] = useState("")
    const [errors, setErrors] = useState([])

    const onFinish = values => (
        console.log('x')
    )

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setMessage("")

        try {
            const res = await fetch("http://localhost:5005/authentication", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
        <>
            <br />
            <hr />

            <h2><i className="fa-solid fa-right-to-bracket"></i> Authentication</h2>
            
            <form onSubmit={handleSubmit}>

                <fieldset className="log-in">
                    <legend>Create an account</legend>
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
        </>
    )
}