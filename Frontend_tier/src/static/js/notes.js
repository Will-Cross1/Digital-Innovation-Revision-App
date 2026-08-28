async function createSubject() {
    const subj_name = document.getElementById("subj_name").value;
    const description = document.getElementById("description").value;

    const payload = {
        name: subj_name,
        description: description
    };

    const response = await fetch("/api/subject/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    if (response.ok) {
        alert("Created new subject");
    } else {
        alert("Error creating subject");
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


async function createNote() {
    const subject_id = document.getElementById("subject_box").value;
    const title = document.getElementById("title").value;
    const payload = {
        title: title,
        content: "",
        subject_id: subject_id
    }

    const response = await fetch("/api/note/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    if (response.ok) {
        alert("Created new note");
    } else {
        alert("Error creating note");
    }
}


async function getNotes() {
    const response = await fetch("/api/note/", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    notes = await response.json();
    return notes
}


function noteSelected(note_id) {
    sessionStorage.setItem("noteId", note_id);
    window.location.href = "/templates/note_open.html";
}


async function loadNotes() {
    const notes = await getNotes();
    const subjects = await getAllSubjects()
    const noteDiv = document.getElementById("user_notes");

    const subjectMap = {};
    subjects.forEach(subject => {
        subjectMap[subject.id] = subject.name;
    });

    notes.sort((a, b) => {
        const subjectA = subjectMap[a.subject_id] || "";
        const subjectB = subjectMap[b.subject_id] || "";

        return subjectA.localeCompare(subjectB);
    });

    noteDiv.innerHTML = "";

    let currentSubject = null;

    notes.forEach(note => {
        const subjectName = subjectMap[note.subject_id];

        if (subjectName !== currentSubject) {
            currentSubject = subjectName;
            const subjectHeading = document.createElement("h2");
            subjectHeading.textContent = subjectName;
            noteDiv.appendChild(subjectHeading);
        }

        const noteTitle = document.createElement("a");
        noteTitle.textContent = note.title;
        noteTitle.href = "/templates/note_open.html";

        noteTitle.addEventListener("click", () => {
            noteSelected(note.id);
        });

        const noteContainer = document.createElement("div");
        noteContainer.appendChild(noteTitle);
        noteDiv.appendChild(noteContainer);
    });
}


document.addEventListener("DOMContentLoaded", () => {
    populateSubjectDropdown();
    loadNotes();
});