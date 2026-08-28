const flashcardId = sessionStorage.getItem("flashcardId");
let updating = false;
let flashcard = null;

// PUBLIC AND PROTECTED

async function getFlashcardInfo() {
    if (!token) {
        const response = await fetch(`/api/flashcard/public/${flashcardId}`, {method: "GET"});
        const flashcardDetails = await response.json();
        return flashcardDetails;
    } else {
        const response = await fetch(`/api/flashcard/private/${flashcardId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const flashcardDetails = await response.json();
        return flashcardDetails;
    }
}


function displayFlashcard(flashcard) {
    document.getElementById("title").textContent = flashcard.name;
    document.getElementById("subject_box").value = flashcard.subject_id;
    const flashcardDiv = document.getElementById("flashcard");

    flashcardDiv.innerHTML = "";

    const questions = flashcard.questions_dict;
    const answers = flashcard.answers_dict;

    Object.keys(questions).forEach(questionId => {
        const questionButton = document.createElement("button");

        questionButton.className = "flashcard-button";
        questionButton.textContent = questions[questionId];

        questionButton.onclick = function () {
            if (!updating) {
                if (questionButton.textContent === questions[questionId]) {
                    questionButton.textContent = answers[questionId];
                } else {
                    questionButton.textContent = questions[questionId];
                }
            }
        };

        flashcardDiv.appendChild(questionButton);
    });
}


// PROTECTED ONLY

async function updateFlashcard() {
    const nameInput = document.getElementById("titleInput");
    const name = nameInput ? nameInput.value : "";
    const subject = document.getElementById("subject_box").value;
    const is_public = document.getElementById("is_public").checked;

    const questions = {};
    const answers = {};

    document.querySelectorAll(".question-row").forEach((row, index) => {
        const qInput = row.querySelector(".question-input");
        const aInput = row.querySelector(".answer-input");
        if (qInput && aInput) {
            const qVal = qInput.value.trim();
            const aVal = aInput.value.trim();

            const duplicate = Object.keys(questions).some(
                key => questions[key] === qVal && answers[key] === aVal
            );

            if (!duplicate) {
                const key = qInput.dataset.id || String(index + 1);
                questions[key] = qInput.value;
                answers[key] = aInput.value;
            }
        }
    });

    const payload = {
        name: name === "" ? null : name,
        questions_dict: questions,
        answers_dict: answers,
        subject_id: subject === "" ? null : subject,
        is_public: is_public
    };

    const response = await fetch(`/api/flashcard/${flashcardId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    if (response.ok) {
        alert("Flashcard updated");
        flashcard = await getFlashcardInfo();

        displayTitle();
        displayFlashcard(flashcard);
        return true;
    } else {
        alert("Error updating flashcard");
        return false;
    }
}


async function toggleUpdating() {
    if (!updating) {
        updating = true;
        document.getElementById("updateToggle").textContent = "Save Changes";

        makeEditable();

    } else {
        const saved = await updateFlashcard();

        if (saved) {
            updating = false;
            document.getElementById("updateToggle").textContent = "Toggle update mode";

            makeUneditable();
        }
    }
}


function addQuestionRow(questionId = "", questionVal = "", answerVal = "") {
    const flashcardDiv = document.getElementById("flashcard");
    const row = document.createElement("div");
    row.className = "question-row";

    const questionInput = document.createElement("input");
    questionInput.className = "question-input";
    questionInput.placeholder = "Question";
    questionInput.dataset.id = questionId || Date.now();
    questionInput.value = questionVal;

    const answerInput = document.createElement("input");
    answerInput.className = "answer-input";
    answerInput.placeholder = "Answer";
    answerInput.dataset.id = questionInput.dataset.id;
    answerInput.value = answerVal;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Remove";
    deleteBtn.onclick = () => row.remove();

    row.appendChild(questionInput);
    row.appendChild(answerInput);
    row.appendChild(deleteBtn);
    flashcardDiv.appendChild(row);
}


function makeEditable() {
    const title = document.getElementById("title");
    const titleInput = document.createElement("input");

    titleInput.id = "titleInput";
    titleInput.value = title.textContent;

    title.replaceWith(titleInput);
    document.getElementById("subject_box").disabled = false;
    const flashcardDiv = document.getElementById("flashcard");

    flashcardDiv.innerHTML = "";

    const questions = flashcard.questions_dict || {};
    const answers = flashcard.answers_dict || {};

    Object.keys(questions).forEach(questionId => {
        addQuestionRow(questionId, questions[questionId], answers[questionId]);
    });

    const addBtn = document.createElement("button");
    addBtn.id = "addQuestionBtn";
    addBtn.type = "button";
    addBtn.textContent = "+ Add Question";
    addBtn.onclick = () => addQuestionRow();
    
    flashcardDiv.after(addBtn);
}


function makeUneditable() {
    document.getElementById("subject_box").disabled = true;
    const addBtn = document.getElementById("addQuestionBtn");
    if (addBtn) {
        addBtn.remove();
    }
}

function displayTitle() {
    const titleInput = document.getElementById("titleInput");

    if (titleInput) {
        const title = document.createElement("h2");
        title.id = "title";
        title.textContent = flashcard.name;
        titleInput.replaceWith(title);
    }
}


function updateFavouriteButton(is_favourite) {
    const toggleButton = document.getElementById("favToggle");
    const isFav = String(is_favourite) === "true" || is_favourite === true;

    if (isFav) {
        toggleButton.textContent = "Favourite: YES";
    } else {
        toggleButton.textContent = "Favourite: NO";
    }
}

async function toggleFavourite() {
    const response = await fetch(`/api/flashcard/favourite/check/${flashcardId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    if (!(response.ok)) {
        alert("Failed to look up favourite")
        return
    }
    const data = await response.json();
    const isFav = data.is_favourite;

    if (isFav) {
        const response = await fetch(`/api/flashcard/favourite/${flashcardId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        if (!(response.ok)) {
            alert("Failed to delete favourite");
            return
        }
        updateFavouriteButton("false");
    } else {
        const response = await fetch(`/api/flashcard/favourite/${flashcardId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        if (!(response.ok)) {
            alert("Failed to create new favourite");
            return
        }
        updateFavouriteButton("true");
    }
}




async function deleteFlashcard() {
    const response = await fetch(`/api/flashcard/${flashcardId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    if (response.ok) {
        sessionStorage.removeItem("flashcardId");
        alert("Flashcard Deleted");
        window.location.href = "/templates/flashcard_search.html";
    } else {
        alert("Failed to delete flashcard");
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



// Quiz stuff

function takeQuiz() {
    window.location.href = "/templates/quiz.html";
}

async function deleteQuizs() {
    const response = await fetch(`/api/quiz/${flashcardId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    if (response.ok) {
        alert("Results Reset");
    } else {
        alert("Failed to delete quiz results");
    }
}

async function getQuizDetails() {
    const response = await fetch(`/api/quiz/${flashcardId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const quizDets = await response.json();
    return quizDets;
}

async function displayQuizResults() {
    const container = document.getElementById("quiz_information");

    try {
        const quizDets = await getQuizDetails();

        if (!quizDets || !Array.isArray(quizDets) || quizDets.length === 0) {
            container.innerHTML = "<p>No quiz attempts yet.</p>";
            return;
        }

        let totalScoreSum = 0;
        let totalQuestionsSum = 0;
        let html = '<ul style="list-style: none; padding-left: 0%;">';

        quizDets.forEach((quiz, index) => {
            const score = Number(quiz.Score || quiz.score || 0);
            const total = Number(quiz.Total_questions || quiz.total_questions || 0);
            const percent = total > 0 ? ((score / total) * 100).toFixed(1) : 0;

            totalScoreSum += score;
            totalQuestionsSum += total;

            html += `<li>Attempt ${index + 1}: ${score}/${total} (${percent}%)</li>`;
        });

        html += "</ul>";

        const overallPercent = totalQuestionsSum > 0 
            ? ((totalScoreSum / totalQuestionsSum) * 100).toFixed(1) 
            : 0;

        html += `<p><strong>Overall Average: ${overallPercent}%</strong></p>`;
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = "<p>No quiz attempts yet.</p>";
    }
}




document.addEventListener("DOMContentLoaded", async () => {
    flashcard = await getFlashcardInfo();
    displayFlashcard(flashcard);
    await populateSubjectDropdown();

    document.getElementById("subject_box").value = flashcard.subject_id;
    document.getElementById("is_public").checked = Boolean(flashcard.is_public);

    if (token) {
        try {
            const favResp = await fetch(`/api/flashcard/favourite/check/${flashcardId}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (favResp.ok) {
                const favData = await favResp.json();
                updateFavouriteButton(favData.is_favourite);
            }
        } catch (e) {
            console.error("Could not fetch favourite status", e);
        }

        displayQuizResults();
        document.getElementById("updateToggle").textContent = "Toggle update mode";
        document.getElementById("subject_box").disabled = true;
    }
});