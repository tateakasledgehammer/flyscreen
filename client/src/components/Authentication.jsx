import { useState, useEffect } from "react"

export default function Authentication() {
    const [usernameInput, setUsernameInput] = useState("")
    const [passwordInput, setPasswordInput] = useState("")
    const [message, setMessage] = useState("")
    const [errors, setErrors] = useState([])

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/authentication", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });
        
        const data = await res.json()

        if (data.success) {
            setMessage(data.message)
            setErrors([])
        } else {
            setErrors(data.errors)
            setMessage("")
        }
    }   catch (err) {
        setErrors(["Server error. Please try again later."]);
        setMessage("");
        console.log(err);
    }
};

    return (
        <>
            <br />
            <hr />

            <h2><i className="fa-solid fa-right-to-bracket"></i> Authentication</h2>
            
            <form action="/authentication" onSubmit={handleSubmit} method="POST">
                
                {errors.map((error, i) => (
                    <p 
                        key={i} 
                        className="notice"
                        style={{ color: "red" }}
                    >
                        {error}
                    </p>
                ))}

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
                    <button type="submit">Set up</button>
                    {message && <p>{message}</p>}
                </fieldset>
            </form>
        </>
    )
}