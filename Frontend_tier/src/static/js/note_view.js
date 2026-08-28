const noteId = sessionStorage.getItem("noteId");

function viewMarkdown() {
    const input = document.getElementById("userNoteInput");
    const view = document.getElementById("userNoteView");

    const markdown = input.value;
    const html = marked.parse(markdown);
    view.innerHTML = DOMPurify.sanitize(html);
}


async function getCurrentNote() {
    const response = await fetch(`/api/note/${noteId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (response.ok) {
        const note = await response.json();
        document.getElementById("title").value = note.title;
        document.getElementById("userNoteInput").value = note.content;

        document.getElementById("created_at").textContent = `Created at: ${note.created_at}`;
        document.getElementById("updated_at").textContent = `Updated at: ${note.updated_at}`;

        document.getElementById("subject_box").value = note.subject_id;

        viewMarkdown();
    } else {
        alert("Failed to load note details");
    }
}


async function updateNote() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("userNoteInput").value;
    const subject = document.getElementById("subject_box").value;

    const payload = {
        title: title === "" ? null : title,
        content: content === "" ? null : content,
        subject_id: subject === "" ? null : subject
    };

    const response = await fetch(`/api/note/${noteId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    if (response.ok) {
        alert("Updated note");
    } else {
        alert("Error updating note details");
    }
}


async function deleteNote() {
    const response = await fetch(`/api/note/${noteId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    if (response.ok) {
        sessionStorage.removeItem("noteId");
        alert("Note Deleted");
        window.location.href = "/templates/note_search.html";
    } else {
        alert("Failed to delete note");
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

document.addEventListener("DOMContentLoaded", () => {
    populateSubjectDropdown();
    getCurrentNote();
});
