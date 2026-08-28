if (sessionStorage.getItem("public") === null) {
    sessionStorage.setItem("public", "false");
}

// PUBLIC AND PROTECTED


function flashcardSelected(flashcard_id) {
    sessionStorage.setItem("flashcardId", flashcard_id);
    window.location.href = "/templates/flashcard_open.html";
}


async function getPublicFlashcards() {
    const response = await fetch("/api/flashcard/public", {method: "GET"});
    const flashcards = await response.json();
    return flashcards;
}

async function getPrivateFlashcards() {
    const response = await fetch("/api/flashcard/private", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const flashcards = await response.json();
    return flashcards;
}



async function loadFlashcards() {
    const subjects = await getAllSubjects();
    if (!token) {
        const flashcards = await getPublicFlashcards();
        displayFlashcards(flashcards, subjects);
    }
    else if (sessionStorage.getItem("public") === "true") {
        const privateFlashcards = await getPrivateFlashcards();
        const publicFlashcards = await getPublicFlashcards();

        const flashcards = [...privateFlashcards, ...publicFlashcards.filter(publicFlashcard =>
            !privateFlashcards.some(privateFlashcard =>
                privateFlashcard.id === publicFlashcard.id
            )
        )];
        displayFlashcards(flashcards, subjects);
    } else {
        const flashcards = await getPrivateFlashcards();
        displayFlashcards(flashcards, subjects);
    }
}


function displayFlashcards(flashcards, subjects) {
    const flashcardDiv = document.getElementById("flashcards_all");

    const subjectMap = {};
    subjects.forEach(subject => {
        subjectMap[subject.id] = subject.name;
    });

    flashcards.sort((a, b) => {
        const subjectA = subjectMap[a.subject_id] || "";
        const subjectB = subjectMap[b.subject_id] || "";

        return subjectA.localeCompare(subjectB);
    });

    flashcardDiv.innerHTML = "";

    let currentSubject = null;

    flashcards.forEach(flashcard => {
        const subjectName = subjectMap[flashcard.subject_id];

        if (subjectName !== currentSubject) {
            currentSubject = subjectName;
            const subjectHeading = document.createElement("h2");
            subjectHeading.textContent = subjectName;
            flashcardDiv.appendChild(subjectHeading);
        }

        const flashcardTitle = document.createElement("a");
        flashcardTitle.textContent = flashcard.name;
        flashcardTitle.href = "/templates/flashcard_open.html";

        flashcardTitle.addEventListener("click", () => {
            flashcardSelected(flashcard.id);
        });

        if (flashcard.is_public) {
            const publicIcon = document.createElement("img");
            publicIcon.src = "/static/assets/public_icon.png";
            publicIcon.alt = "Public";
            publicIcon.style.width = "20px";
            publicIcon.style.marginLeft = "5px";

            flashcardTitle.appendChild(publicIcon);
        }

        const flashcardContainer = document.createElement("div");
        flashcardContainer.appendChild(flashcardTitle);
        flashcardDiv.appendChild(flashcardContainer);
    });
}


// PROTECTED ONLY

function updatePublicButton() {
    const button = document.getElementById("public_toggle");

    if (sessionStorage.getItem("public") === "true") {
        button.textContent = "Inc Public: ON";
    } else {
        button.textContent = "Inc Public: OFF";
    }
}

function togglePublic() {
    const public = sessionStorage.getItem("public");
    if (public === "true") {
        sessionStorage.setItem("public", "false");
    } else {
        sessionStorage.setItem("public", "true");
    }
    updatePublicButton();
    loadFlashcards();
}

async function createFlashcard() {
    const subject_id = document.getElementById("subject_box").value;
    const name = document.getElementById("name").value;
    const is_public = document.getElementById("is_public").checked;
    const payload = {
        name: name,
        questions_dict: {},
        answers_dict: {},
        subject_id: subject_id,
        is_public: is_public
    }

    const response = await fetch("/api/flashcard/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    if (response.ok) {
        const flashcard_info = await response.json();
        alert("Created new flashcard");
        flashcardSelected(flashcard_info.id)
    } else {
        alert("Error creating flashcard");
    }
}

async function getAllSubjects() {
    const response = await fetch("/api/subject/", {method: "GET"})
    const subjects = await response.json();
    return subjects
}

async function populateSubjectDropdown() {
    const subjects = await getAllSubjects()
    const dropdown = document.getElementById("subject_box");

    dropdown.innerHTML = "";

    subjects.forEach(subject => {
        const option = document.createElement("option");

        option.value = subject.id;
        option.textContent = subject.name;

        dropdown.appendChild(option);
    });
}


async function loadFaves() {
    const response = await fetch("/api/flashcard/favourite", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    faves = await response.json();
    const subjects = await getAllSubjects();
    displayFavourites(faves, subjects);
}



function displayFavourites(faves, subjects) {
    const faveDiv = document.getElementById("flashcards_fav");

    const subjectMap = {};
    subjects.forEach(subject => {
        subjectMap[subject.id] = subject.name;
    });

    faves.sort((a, b) => {
        const subjectA = subjectMap[a.subject_id] || "";
        const subjectB = subjectMap[b.subject_id] || "";
        return subjectA.localeCompare(subjectB);
    });

    faveDiv.innerHTML = "";

    let currentSubject = null;

    faves.forEach(flashcard => {
        const subjectName = subjectMap[flashcard.subject_id];

        if (subjectName !== currentSubject) {
            currentSubject = subjectName;
            const subjectHeading = document.createElement("h2");
            subjectHeading.textContent = subjectName;
            faveDiv.appendChild(subjectHeading);
        }

        const flashcardTitle = document.createElement("a");
        flashcardTitle.textContent = flashcard.name;
        flashcardTitle.href = "/templates/flashcard_open.html";

        flashcardTitle.addEventListener("click", () => {
            flashcardSelected(flashcard.id);
        });

        if (flashcard.is_public) {
            const publicIcon = document.createElement("img");
            publicIcon.src = "/static/assets/public_icon.png";
            publicIcon.alt = "Public";
            publicIcon.style.width = "20px";
            publicIcon.style.marginLeft = "5px";

            flashcardTitle.appendChild(publicIcon);
        }

        const flashcardContainer = document.createElement("div");
        flashcardContainer.appendChild(flashcardTitle);
        faveDiv.appendChild(flashcardContainer);
    });
}



document.addEventListener("DOMContentLoaded", () => {
    loadFlashcards();

    if (token) {
        populateSubjectDropdown();
        loadFaves();
        updatePublicButton();
    }
});
