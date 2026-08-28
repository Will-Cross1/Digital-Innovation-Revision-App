async function register() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const payload = {
        username: username,
        email: email,
        password: password
    };

    const response = await fetch("/api/user/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    if (response.ok) {
        alert("New user registered");
        window.location.href = "/templates/login.html";
    } else {
        alert("Error registering user");
    }
}