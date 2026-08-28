const flashcardId = sessionStorage.getItem("flashcardId");
let currentFlashcard = null;

async function getFlashcardInfo() {
    const response = await fetch(`/api/flashcard/private/${flashcardId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const flashcardDetails = await response.json();
    return flashcardDetails;
}

function displayQuiz(flashcard) {
    const quizDiv = document.getElementById("flashcard_quiz");
    quizDiv.innerHTML = "";

    const questions = flashcard.questions_dict || {};

    Object.keys(questions).forEach(questionId => {
        const questionContainer = document.createElement("div");
        questionContainer.className = "quiz-item";

        const label = document.createElement("p");
        label.textContent = questions[questionId];

        const input = document.createElement("input");
        input.type = "text";
        input.className = "quiz-answer-input";
        input.dataset.id = questionId;
        input.placeholder = "Type your answer here:";

        questionContainer.appendChild(label);
        questionContainer.appendChild(input);
        quizDiv.appendChild(questionContainer);
    });
}

async function submitQuiz() {
    const questions = currentFlashcard.questions_dict || {};
    const answers = currentFlashcard.answers_dict || {};
    const questionIds = Object.keys(questions);
    
    let score = 0;
    const totalQuestions = questionIds.length;

    document.querySelectorAll(".quiz-answer-input").forEach(input => {
        const qId = input.dataset.id;
        const userAnswer = input.value.trim();
        const correctAnswer = (answers[qId] || "").trim();

        if (userAnswer === correctAnswer) {
            score++;
        }
    });

    await addQuizRes(score, totalQuestions);
    document.getElementById("score_display").textContent = score;
}


async function addQuizRes(score, total_questions) {
    const payload = {
        flashcard_id: flashcardId,
        score: score,
        total_questions: total_questions
    }

    await fetch("/api/quiz/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
}

function goBack() {
    window.location.href = "/templates/flashcard_open.html";
}

document.addEventListener("DOMContentLoaded", async () => {
    currentFlashcard = await getFlashcardInfo();
    displayQuiz(currentFlashcard);
});