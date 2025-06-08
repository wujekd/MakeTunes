# MakeTunes Backend API Documentation

This document provides a comprehensive overview of all API endpoints available in the MakeTunes backend.

## Base URL
All endpoints are prefixed with the base URL: `http://localhost:5000/api`

---

## ProjectControllers

**Base Route:** `/api/ProjectControllers`

The ProjectControllers manages the complete lifecycle of projects and collaborations (collabs) with enhanced release management features.

### Key Features
- **Collab Release Management**: Collabs start as drafts and must be released to become active
- **Draft/Release Workflow**: Only released collabs appear in public views
- **Business Rules**: Released collabs cannot be edited but can be deleted

### Endpoints

#### GET `/api/ProjectControllers`
**Purpose:** Get all projects with only released collabs  
**Returns:** Array of Project objects with their released collaborations  
**Use Case:** Main projects view for users  

```json
[
  {
    "id": "project-guid",
    "name": "My Project",
    "description": "Project description",
    "collabs": [/* only released collabs */],
    "isInVotingStage": false
  }
]
```

#### GET `/api/ProjectControllers/{id}`
**Purpose:** Get specific project with ALL collabs (including drafts)  
**Returns:** Project object with all collaborations  
**Use Case:** Project management view  

```json
{
  "id": "project-guid", 
  "name": "My Project",
  "description": "Project description",
  "collabs": [/* all collabs including drafts */],
  "isInVotingStage": false
}
```

#### POST `/api/ProjectControllers`
**Purpose:** Create new project  
**Body:** 
```json
{
  "name": "Project Name",
  "description": "Project Description"
}
```
**Returns:** Created project with initial collab  

#### POST `/api/ProjectControllers/{projectId}/collabs`
**Purpose:** Create new collab for project  
**Body:**
```json
{
  "name": "Collab Name",
  "description": "Collab Description", 
  "submissionDuration": "7:00:00",  // Optional: 7 days
  "votingDuration": "3:00:00"       // Optional: 3 days
}
```
**Returns:** Created collab (unreleased by default)  
**Notes:** New collabs start as drafts (`Released: false`)

#### PUT `/api/ProjectControllers/collabs/{id}`
**Purpose:** Update existing collab  
**Body:** Same as create collab  
**Returns:** Updated collab  
**Restrictions:** Only works for unreleased collabs  

#### PUT `/api/ProjectControllers/collabs/{id}/release`
**Purpose:** Release a collab (one-way action)  
**Body:** None  
**Returns:** Released collab  
**Notes:** 
- Irreversible action
- Makes collab visible in public views
- Enables submissions

#### DELETE `/api/ProjectControllers/collabs/{id}`
**Purpose:** Delete collab and cleanup files  
**Returns:** Success message  
**Notes:** 
- Deletes associated submissions and audio files
- Can delete both released and unreleased collabs

#### GET `/api/ProjectControllers/collabs/{collabId}/submissions`
**Purpose:** Get submissions for a collab with metadata  
**Returns:** Array of submissions with listen/favorite status  

```json
[
  {
    "id": 1,
    "audioFilePath": "/uploads/file.mp3",
    "collabId": 1,
    "createdAt": "2024-01-01T00:00:00Z",
    "status": "Active",
    "volumeOffset": 1.0,
    "listened": true,
    "favorited": false,
    "final": false
  }
]
```

#### POST `/api/ProjectControllers/collabs/{collabId}/submissions`
**Purpose:** Add submission to collab  
**Body:** Form data with audio file and optional volume offset  
**Returns:** Created submission  
**Restrictions:** Only works for released collabs  

---

## VotingControllers

**Base Route:** `/api/VotingControllers`

Manages the voting system including favorites, final choices, and listen tracking.

### Endpoints

#### POST `/api/VotingControllers/add-favorite`
**Purpose:** Add submission to favorites  
**Body:**
```json
{
  "submissionId": 1,
  "collabId": 1
}
```
**Returns:** Created favorite object  

#### DELETE `/api/VotingControllers/remove-favorite`
**Purpose:** Remove submission from favorites  
**Body:** Same as add favorite  
**Returns:** Success status  

#### PUT `/api/VotingControllers/{submissionId}/final-choice`
**Purpose:** Mark favorite as final choice  
**Returns:** Updated favorite object  
**Notes:** Automatically unmarks previous final choice for the collab  

#### GET `/api/VotingControllers/collab/{collabId}`
**Purpose:** Get all favorites for a collaboration  
**Returns:** Array of favorite objects  

```json
[
  {
    "id": 1,
    "submissionId": 1,
    "collabId": 1,
    "isFinalChoice": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST `/api/VotingControllers/submissions/{submissionId}/mark-listened`
**Purpose:** Mark submission as listened  
**Returns:** Created listened record  
**Notes:** Prevents duplicate listened markings  

---

## ProjectsController (Legacy)

**Base Route:** `/api/projects`

The original projects controller with basic CRUD operations.

### Endpoints

#### GET `/api/projects`
**Purpose:** Get all projects with all collabs  
**Returns:** Array of project objects  

#### GET `/api/projects/{id}`
**Purpose:** Get specific project  
**Returns:** Project object with collabs  

#### POST `/api/projects`
**Purpose:** Create new project  
**Body:**
```json
{
  "name": "Project Name",
  "description": "Project Description"
}
```

#### POST `/api/projects/{projectId}/collabs`
**Purpose:** Create new collab with file upload  
**Body:** Form data with name, description, and optional audio file  
**Returns:** Created collab  

#### GET `/api/projects/collabs/{collabId}/submissions`
**Purpose:** Get submissions for collab  
**Returns:** Array of submissions with metadata  

#### POST `/api/projects/collabs/{collabId}/submissions`
**Purpose:** Add submission to collab  
**Body:** Form data with audio file and volume offset  
**Returns:** Created submission  

---

## DevController

**Base Route:** `/api/dev`

Development and testing utilities.

### Endpoints

#### POST `/api/dev/collabs/{collabId}/stage`
**Purpose:** Switch collab between submission and voting stages  
**Body:**
```json
{
  "stage": "voting" // or "submission"
}
```
**Returns:** Updated collab  
**Notes:** Development tool for testing stage transitions  

#### GET `/api/dev/delete-all-submissions`
**Purpose:** Delete all submissions from database  
**Returns:** Success message  
**Warning:** ⚠️ Destructive operation for development/testing only  

---

## Data Models

### Core Entities

**Project**
```json
{
  "id": "string (GUID)",
  "name": "string",
  "description": "string", 
  "collabs": "Collab[]",
  "isInVotingStage": "boolean"
}
```

**Collab**
```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "projectId": "string",
  "audioFilePath": "string?",
  "released": "boolean",
  "submissionDuration": "TimeSpan?",
  "votingDuration": "TimeSpan?", 
  "completed": "boolean",
  "stage": "CollabStage enum"
}
```

**Submission**
```json
{
  "id": "integer",
  "audioFilePath": "string",
  "collabId": "integer",
  "volumeOffset": "float",
  "createdAt": "DateTime",
  "status": "string"
}
```

**Favorite**
```json
{
  "id": "integer",
  "submissionId": "integer",
  "collabId": "integer", 
  "isFinalChoice": "boolean",
  "createdAt": "DateTime"
}
```

### DTOs

**CreateCollabDto / UpdateCollabDto**
```json
{
  "name": "string (required)",
  "description": "string (required)",
  "submissionDuration": "string? (format: 'HH:mm:ss')",
  "votingDuration": "string? (format: 'HH:mm:ss')"
}
```

**CreateFavoriteDto**
```json
{
  "submissionId": "integer",
  "collabId": "integer"
}
```

---

## Business Rules

### Collab Lifecycle
1. **Draft State**: New collabs start unreleased (`Released: false`)
2. **Edit Phase**: Unreleased collabs can be created, updated, and deleted
3. **Release Phase**: One-way action makes collab public and enables submissions
4. **Post-Release**: Released collabs cannot be edited but can be deleted

### Submission Rules
- Submissions only allowed on released collabs
- Each submission generates unique file names to prevent conflicts
- Files are stored in `wwwroot/uploads/` directory

### Voting Rules
- Only one final choice allowed per collab
- Setting new final choice automatically unmarks previous one
- Listen tracking prevents duplicate markings per project

### File Management
- Automatic file cleanup when deleting collabs or submissions
- Unique file naming prevents conflicts
- Files stored with GUID prefixes

---

## Error Responses

All endpoints return appropriate HTTP status codes:

- **200 OK**: Successful operation
- **201 Created**: Resource created successfully  
- **204 No Content**: Successful deletion
- **400 Bad Request**: Invalid request data or business rule violation
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server error

Common error response format:
```json
{
  "message": "Error description"
}
```

---

## Migration Notes

The codebase contains both new (`ProjectControllers`) and legacy (`ProjectsController`) endpoints. The new controller provides enhanced collab management with release workflows, while the legacy controller maintains backward compatibility for existing functionality. 