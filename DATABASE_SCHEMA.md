# Firestore Database Schema & Collections

This document describes the database structure for the Student Achievement System.

## Collections Overview

```
Firestore Database
├── users/                    # User profiles and roles
├── achievements/             # Student achievements/submissions
├── categories/               # Achievement categories
├── notifications/            # User notifications
└── verification-queue/       # Pending verifications (optional)
```

---

## 1. Users Collection

**Collection Path**: `users/{userId}`

**Document Structure**:
```json
{
  "id": "user_uid_from_firebase_auth",
  "email": "student@institution.edu",
  "displayName": "John Doe",
  "role": "student",
  "department": "Computer Science",
  "enrollmentNumber": "CS2024001",
  "profileImageUrl": "https://storage.example.com/...",
  "phoneNumber": "+91-9876543210",
  "createdAt": "2024-02-03T10:30:00Z",
  "updatedAt": "2024-02-03T10:30:00Z",
  "lastLogin": "2024-02-03T10:30:00Z",
  "isActive": true
}
```

**Indexes**:
- `email` (ascending)
- `role` (ascending)
- `department` (ascending)

**Sample Documents**:

**Student User**:
```json
{
  "id": "student_uid_123",
  "email": "alice.johnson@college.edu",
  "displayName": "Alice Johnson",
  "role": "student",
  "department": "Information Technology",
  "enrollmentNumber": "IT2022045",
  "createdAt": "2023-09-15T08:00:00Z",
  "isActive": true
}
```

**Faculty User**:
```json
{
  "id": "faculty_uid_456",
  "email": "dr.smith@college.edu",
  "displayName": "Dr. Smith",
  "role": "faculty",
  "department": "Information Technology",
  "createdAt": "2020-01-10T09:00:00Z",
  "isActive": true
}
```

**Admin User**:
```json
{
  "id": "admin_uid_789",
  "email": "admin@college.edu",
  "displayName": "Admin User",
  "role": "admin",
  "department": "Administration",
  "createdAt": "2019-01-01T00:00:00Z",
  "isActive": true
}
```

---

## 2. Achievements Collection

**Collection Path**: `achievements/{achievementId}`

**Document Structure**:
```json
{
  "id": "achievement_unique_id",
  "studentId": "user_uid_from_firebase_auth",
  "studentEmail": "student@institution.edu",
  "studentName": "John Doe",
  "title": "Technical Symposium Participation",
  "description": "Participated in the Annual Technical Symposium 2024 with presentation on Machine Learning",
  "category": "conference",
  "organizationName": "College Technical Forum",
  "eventDate": "2024-01-15T00:00:00Z",
  "certificateUrl": "gs://bucket-name/certificates/student_uid/file_name.pdf",
  "certificateFileName": "symposium_certificate.pdf",
  "certificateSize": 2048576,
  "status": "pending",
  "remarks": "",
  "verifiedBy": "",
  "verifiedByName": "",
  "verificationDate": null,
  "department": "Computer Science",
  "submittedAt": "2024-02-03T10:30:00Z",
  "updatedAt": "2024-02-03T10:30:00Z",
  "tags": ["technical", "conference", "2024"],
  "isPublic": false
}
```

**Indexes**:
- `studentId` (ascending)
- `status` (ascending)
- `category` (ascending)
- `submittedAt` (descending)
- `studentId, status` (composite)

**Sample Document**:
```json
{
  "id": "achievement_abc123",
  "studentId": "student_uid_123",
  "studentEmail": "alice.johnson@college.edu",
  "studentName": "Alice Johnson",
  "title": "National Coding Championship",
  "description": "Won Gold Medal in National Coding Championship 2024",
  "category": "competition",
  "organizationName": "National Coding Association",
  "eventDate": "2024-01-20T00:00:00Z",
  "certificateUrl": "gs://student-achievement.appspot.com/certificates/...",
  "status": "approved",
  "remarks": "Certificate verified - legitimate achievement",
  "verifiedBy": "faculty_uid_456",
  "verifiedByName": "Dr. Smith",
  "verificationDate": "2024-02-02T14:30:00Z",
  "department": "Information Technology",
  "submittedAt": "2024-01-25T09:00:00Z",
  "updatedAt": "2024-02-02T14:30:00Z",
  "tags": ["coding", "competition", "national"],
  "isPublic": true
}
```

**Status Values**:
- `pending` - Awaiting faculty verification
- `approved` - Verified and approved by faculty
- `rejected` - Rejected by faculty

---

## 3. Categories Collection

**Collection Path**: `categories/{categoryId}`

**Document Structure**:
```json
{
  "id": "category_unique_id",
  "name": "Technical Conference",
  "slug": "technical-conference",
  "description": "Participation in technical conferences and seminars",
  "icon": "conference",
  "color": "#3b82f6",
  "order": 1,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}
```

**Sample Categories**:

```json
[
  {
    "id": "cat_001",
    "name": "Conference",
    "slug": "conference",
    "description": "International and national conference participations",
    "order": 1,
    "isActive": true
  },
  {
    "id": "cat_002",
    "name": "Competition",
    "slug": "competition",
    "description": "Coding and technical competitions",
    "order": 2,
    "isActive": true
  },
  {
    "id": "cat_003",
    "name": "Workshop",
    "slug": "workshop",
    "description": "Technical workshops and training sessions",
    "order": 3,
    "isActive": true
  },
  {
    "id": "cat_004",
    "name": "Certification",
    "slug": "certification",
    "description": "Professional certifications obtained",
    "order": 4,
    "isActive": true
  },
  {
    "id": "cat_005",
    "name": "Publication",
    "slug": "publication",
    "description": "Research papers and article publications",
    "order": 5,
    "isActive": true
  },
  {
    "id": "cat_006",
    "name": "Award",
    "slug": "award",
    "description": "Awards and recognitions received",
    "order": 6,
    "isActive": true
  }
]
```

---

## 4. Notifications Collection

**Collection Path**: `notifications/{notificationId}`

**Document Structure**:
```json
{
  "id": "notification_unique_id",
  "userId": "user_uid_from_firebase_auth",
  "type": "achievement_approved",
  "title": "Achievement Approved",
  "message": "Your achievement 'Technical Symposium Participation' has been approved",
  "relatedAchievementId": "achievement_abc123",
  "relatedAchievementTitle": "Technical Symposium Participation",
  "actionUrl": "/achievements/achievement_abc123",
  "isRead": false,
  "createdAt": "2024-02-03T10:30:00Z",
  "readAt": null,
  "priority": "normal"
}
```

**Indexes**:
- `userId` (ascending)
- `isRead` (ascending)
- `createdAt` (descending)
- `userId, isRead` (composite)
- `userId, createdAt` (composite)

**Notification Types**:
- `achievement_submitted` - When student submits achievement
- `achievement_approved` - When faculty approves achievement
- `achievement_rejected` - When faculty rejects achievement
- `achievement_updated` - When achievement details are updated
- `verification_pending` - When achievement awaits verification
- `admin_alert` - System alerts for administrators

**Sample Documents**:

```json
{
  "id": "notif_001",
  "userId": "student_uid_123",
  "type": "achievement_approved",
  "title": "Achievement Approved!",
  "message": "Your achievement 'National Coding Championship' has been approved by Dr. Smith",
  "relatedAchievementId": "achievement_abc123",
  "relatedAchievementTitle": "National Coding Championship",
  "actionUrl": "/dashboard/achievements/achievement_abc123",
  "isRead": true,
  "createdAt": "2024-02-02T14:30:00Z",
  "readAt": "2024-02-02T15:00:00Z",
  "priority": "high"
}
```

---

## 5. Verification Queue (Optional)

**Collection Path**: `verification-queue/{queueItemId}`

**Document Structure** (for performance optimization):
```json
{
  "id": "queue_item_id",
  "achievementId": "achievement_abc123",
  "studentId": "student_uid_123",
  "studentName": "Alice Johnson",
  "studentEmail": "alice.johnson@college.edu",
  "title": "Technical Achievement",
  "submittedAt": "2024-02-01T10:00:00Z",
  "assignedTo": "faculty_uid_456",
  "assignedAt": "2024-02-01T11:00:00Z",
  "status": "pending",
  "priority": "normal",
  "daysWaiting": 2
}
```

---

## Analytics Collection (Optional Future Enhancement)

**Collection Path**: `analytics/reports/{reportId}`

```json
{
  "id": "report_2024_feb",
  "month": "2024-02",
  "totalSubmissions": 45,
  "totalApproved": 38,
  "totalRejected": 5,
  "totalPending": 2,
  "departmentStats": {
    "IT": { "submitted": 20, "approved": 18 },
    "CS": { "submitted": 15, "approved": 13 },
    "EC": { "submitted": 10, "approved": 7 }
  },
  "categoryStats": {
    "conference": 18,
    "competition": 15,
    "certification": 8,
    "workshop": 4
  },
  "averageVerificationDays": 2.5,
  "generatedAt": "2024-02-03T23:59:59Z"
}
```

---

## Data Relationships

```
users (1) ──── (many) achievements
                          │
                          ├──→ categories
                          └──→ users (verified by faculty)

users (1) ──── (many) notifications
```

---

## Storage Structure (Firebase Storage)

```
gs://student-achievement-bucket/
├── certificates/
│   ├── {userId}/
│   │   ├── certificate_1.pdf
│   │   ├── certificate_2.jpg
│   │   └── ...
│   └── ...
├── profile-images/
│   ├── {userId}.jpg
│   └── ...
└── reports/
    ├── monthly_report_2024_02.pdf
    └── ...
```

---

## Backup & Archival

**Recommended**: 
- Daily automated backups to Cloud Storage
- Monthly export to BigQuery for analytics
- Archive old records to cheaper storage tier after 2 years

---

## Data Privacy & Retention

- **Student Data**: Retain for 4 years after graduation
- **Achievement Records**: Permanent retention
- **Audit Logs**: 1 year retention
- **Notifications**: Delete after 90 days of creation

---

## Query Examples

### Get all pending achievements for verification:
```
db.collection('achievements')
  .where('status', '==', 'pending')
  .orderBy('submittedAt', 'desc')
  .limit(50)
```

### Get student's approved achievements:
```
db.collection('achievements')
  .where('studentId', '==', userId)
  .where('status', '==', 'approved')
  .orderBy('verificationDate', 'desc')
```

### Get unread notifications:
```
db.collection('notifications')
  .where('userId', '==', userId)
  .where('isRead', '==', false)
  .orderBy('createdAt', 'desc')
```

---

**Document Version**: 1.0  
**Last Updated**: February 3, 2026  
**Status**: ✅ Ready for Implementation
