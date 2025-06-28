# 📝Personal Notes Management API

A full-stack application for managing **notes, drafts, tags**, and **feature flags**, built with:

* **Backend**: ASP.NET Web API (.NET)
* **Frontend**: Angular
* **Database**: PostgreSQL

This system supports CRUD operations on notes and drafts, search and tagging, pinning, and exporting notes in multiple formats (PDF, image, HTML).

---

## 📌 Features

* 📂 **Draft Management**: Save temporary or in-progress notes.
* 📒 **Note CRUD**: Create, update, and delete rich text notes.
* 📍 **Pin Notes**: Mark notes as important.
* 🔎 **Search Notes**: Find notes by text or tag.
* 🏷 **Tags**: Organize notes with tags.
* 📄 **Export Notes**: Export as PDF, image, or HTML.
* 🚩 **Feature Flags**: Toggle application features dynamically.

---

## 🚀 API Endpoints

### 📁 Drafts

| Method | Endpoint           | Description          |
| ------ | ------------------ | -------------------- |
| GET    | `/api/Drafts`      | Get all drafts       |
| POST   | `/api/Drafts`      | Create a new draft   |
| GET    | `/api/Drafts/{id}` | Get a specific draft |
| PUT    | `/api/Drafts/{id}` | Update a draft       |
| DELETE | `/api/Drafts/{id}` | Delete a draft       |

---

### 📝 Notes

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| GET    | `/api/Notes`          | Get all notes       |
| POST   | `/api/Notes`          | Create a new note   |
| GET    | `/api/Notes/{id}`     | Get a note by ID    |
| PUT    | `/api/Notes/{id}`     | Update a note       |
| DELETE | `/api/Notes/{id}`     | Delete a note       |
| PATCH  | `/api/Notes/{id}/pin` | Pin or unpin a note |

---

### 📄 Export

| Method | Endpoint                            | Description             |
| ------ | ----------------------------------- | ----------------------- |
| GET    | `/api/Notes/{id}/export`            | Export note (e.g., PDF) |
| GET    | `/api/Notes/{id}/export/image`      | Export note as image    |
| GET    | `/api/Notes/notes/{id}/export/html` | Export note as HTML     |

---

### 🔍 Search & Tags

| Method | Endpoint            | Description            |
| ------ | ------------------- | ---------------------- |
| GET    | `/api/Notes/search` | Search notes by query  |
| GET    | `/api/Notes/tags`   | Get tags used in notes |
| GET    | `/api/Tags`         | Get all available tags |

---

### 🚩 Feature Flags

| Method | Endpoint           | Description          |
| ------ | ------------------ | -------------------- |
| GET    | `/api/FeatureFlag` | List available flags |

---


