# SkillBridge -- Tutoring Platform API

SkillBridge is a backend API for an online tutoring marketplace where
students can discover tutors, book sessions, and leave reviews. Tutors
can manage teaching sessions and availability, while administrators
manage users, tutors, subjects, and bookings.

---

# Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- TypeScript
- Better Auth

---

# Base URL

    http://localhost:5000/api

---

# Authentication

## Register User

**POST** `/auth/sign-up/email`

Request Body

```json
{
    "email": "admin@skillbridge.com",
    "password": "admin123",
    "name": "Admin"
}
```

---

## Login

**POST** `/auth/sign-in/email`

```json
{
    "email": "admin@skillbridge.com",
    "password": "admin123"
}
```

---

# Tutor Module

## Create Tutor Profile

**POST** `/v1/tutor/create`

```json
{
    "bio": "I am a Senior Software Engineer with 10 years of experience in Fullstack development and cloud architecture."
}
```

---

## Update Tutor Profile

**PUT** `/v1/tutor/updateTutorProfile`

```json
{
    "tutorProfileId": "a9e6eb81-7bba-4f7e-bbe3-523bbe48d6a5",
    "bio": "Updated tutor profile bio"
}
```

---

## Get My Tutor Profile

`GET /v1/tutor/getMyProfile`

---

## Get Tutor By ID

`GET /v1/tutor/:tutorProfileId`

Example

    /v1/tutor/a9e6eb81-7bba-4f7e-bbe3-523bbe48d6a5

---

## Get All Tutors

`GET /v1/tutor/getAllTutors`

Query Parameters

Parameter Description

---

page page number
limit results per page
search search tutors
subject filter by subject
minPrice minimum price
maxPrice maximum price
status tutor approval status
sortBy sort field
sortOrder asc / desc

Example

    /v1/tutor/getAllTutors?page=1&search=admin&subject=physics

---

## Admin Get All Tutors

`GET /v1/tutor/getAllTutors/admin?status=PENDING`

---

## Approve Tutor (Admin)

**PATCH** `/v1/tutor/approve`

```json
{
    "tutorProfileId": "a9e6eb81-7bba-4f7e-bbe3-523bbe48d6a5",
    "status": "approved"
}
```

---

# Teaching Session Module

## Create Teaching Session

**POST** `/v1/tutor/createTeachingSession`

```json
{
    "subjectName": "docker containerization",
    "hourlyRate": 45.5,
    "level": "BEGINNER"
}
```

---

## Update Teaching Session

**PUT** `/v1/tutor/updateTeachingSession/:sessionId`

Example

    /v1/tutor/updateTeachingSession/001c103f-4ec7-48bc-aab8-00faa455cfe3

```json
{
    "level": "INTERMEDIATE"
}
```

---

## Delete Teaching Session

`DELETE /v1/tutor/deleteTeachingSession/:sessionId`

---

## Get Tutor Teaching Sessions

`GET /v1/tutor/getTeachingSession`

---

# Availability Module

## Create Availability

**POST** `/v1/availability/create`

```json
{
    "startDate": "2026-01-01",
    "endDate": "2026-06-30",
    "slots": [
        {
            "dayOfWeek": "MON",
            "startTime": "18:00",
            "endTime": "20:00"
        },
        {
            "dayOfWeek": "WED",
            "startTime": "16:00",
            "endTime": "18:00"
        }
    ]
}
```

---

## Update Availability

`PATCH /v1/availability/update/:availabilityId`

---

## Get My Availability

`GET /v1/availability/me`

---

## Get Availability By Tutor Profile

`GET /v1/availability/:tutorProfileId`

---

## Delete Availability

`DELETE /v1/availability/delete/:availabilityId`

---

# Booking Module

## Create Booking

**POST** `/v1/booking/create`

```json
{
    "tutorCategoryId": "001c103f-4ec7-48bc-aab8-00faa455cfe3",
    "sessionDate": "2026-03-16",
    "startTime": "10:00",
    "endTime": "12:00"
}
```

---

## Get My Sessions

`GET /v1/booking/my-sessions`

---

## Get Upcoming Sessions

`GET /v1/booking/upcoming`

---

## Update Booking Status

`PATCH /v1/booking/:bookingId/status`

```json
{
    "status": "COMPLETED"
}
```

Optional

```json
{
    "meetingLink": "link.google-meet.com"
}
```

---

## Tutor Teaching Sessions

`GET /v1/booking/teaching?status=PENDING`

---

## Admin Get All Bookings

`GET /v1/booking/getAllBooking`

Example

    /v1/booking/getAllBooking?status=CANCELLED&page=1&limit=10

---

# Subject Module (Admin)

## Get All Subjects

`GET /v1/subject/getAllSubjects`

---

## Create Subject

**POST** `/v1/subject/create`

```json
{
    "subject": "assignment 4"
}
```

---

## Update Subject

`PATCH /v1/subject/update/:subjectId`

---

## Delete Subject

`DELETE /v1/subject/delete/:subjectId`

---

# Review Module

## Create Review

**POST** `/v1/review/create`

```json
{
    "bookingId": "",
    "rating": 3,
    "comment": "I like this teacher"
}
```

---

## Get Reviews By Tutor

`GET /v1/review/:tutorProfileId`

---

## Get My Reviews

`GET /v1/review/my`

---

# Admin Module

## Get All Users

`GET /v1/admin/users`

Example

    /v1/admin/users?limit=10&page=1&search=email

---

## Ban / Unban User

`PATCH /v1/admin/users/:userId/status`

```json
{
    "status": "BANNED"
}
```

---

# Admin Credentials

    Email: admin@skillbridge.com
    Password: admin123

---

# Core Features

### Public

- Browse tutors
- Search tutors
- Filter tutors by subject and price
- View tutor profiles
- View tutor reviews

### Student

- Register / login
- Book tutoring sessions
- View upcoming sessions
- View past sessions
- Leave reviews

### Tutor

- Create tutor profile
- Create teaching sessions
- Set availability
- View teaching sessions
- See ratings and reviews

### Admin

- View all users
- Ban / unban users
- Approve tutors
- Manage subjects
- View all bookings
