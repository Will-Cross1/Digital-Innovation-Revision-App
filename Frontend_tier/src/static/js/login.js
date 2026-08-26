async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const payload = {
        email: email,
        password: password
    };

    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("accessToken", data.access_token);
        alert("User logged in");
        window.location.href = "/templates/index.html";
    } else {
        alert("Error logging in");
    }
}
