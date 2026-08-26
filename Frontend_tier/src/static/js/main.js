const token = sessionStorage.getItem("accessToken");

if (token) {
    document.querySelectorAll(".logged-in").forEach(element => {element.style.display = ""});
    document.querySelectorAll(".logged-out").forEach(element => {element.style.display = "none"});
} else {
    document.querySelectorAll(".logged-in").forEach(element => {element.style.display = "none"});
    document.querySelectorAll(".logged-out").forEach(element => {element.style.display = ""});
}

const logoutButton = document.getElementById("logout");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        sessionStorage.removeItem("accessToken");
        window.location.href = "/templates/index.html";
    });
}
