async function getUser() {
    const response = await fetch("/api/user/", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (response.ok) {
        const user = await response.json();
        document.getElementById("username").value = user.username;
        document.getElementById("email").value = user.email;
    } else {
        alert("Failed to load user details");
    }
}

async function update() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const payload = {
        username: username === "" ? null : username,
        email: email === "" ? null : email,
        password: password === "" ? null : password
    };

    const response = await fetch("/api/user/", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    if (response.ok) {
        alert("Updated details");
    } else {
        alert("Error updating user details");
    }
}

async function deleteAccount() {
    const response = await fetch("/api/user/", {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        },
    })
    if (response.ok) {
        sessionStorage.removeItem("accessToken");
        alert("User Deleted");
        window.location.href = "/templates/index.html";
    } else {
        alert("Failed to delete user");
    }
}

getUser();