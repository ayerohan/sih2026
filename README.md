HI guys/girls


out project str
src/main/java/com/sitesync/

├── config/
│
├── controller/
│   ├── ProjectController
│   ├── ScheduleController
│   ├── ScheduleActivityController
│   ├── ProgressReportController
│   ├── ActivityMatchController
│   ├── ReviewController
│   └── DashboardController
│
├── service/
│   ├── ProjectService
│   ├── ScheduleService
│   ├── ScheduleActivityService
│   ├── ProgressReportService
│   ├── ExtractionService
│   ├── ActivityMatchingService
│   ├── ReviewService
│   ├── ProgressUpdateService
│   └── AuditService
│
├── repository/
│   ├── ProjectRepository
│   ├── ScheduleRepository
│   ├── ScheduleActivityRepository
│   ├── ProgressReportRepository
│   ├── ExtractedEventRepository
│   ├── ActivityMatchRepository
│   ├── ReviewRepository
│   ├── ActualProgressRepository
│   └── AuditLogRepository
│
├── entity/
│   ├── User
│   ├── Project
│   ├── ProjectMember
│   ├── Schedule
│   ├── ScheduleActivity
│   ├── ProgressReport
│   ├── ExtractedEvent
│   ├── ActivityMatch
│   ├── Review
│   ├── ActualProgress
│   └── AuditLog
│
├── dto/
│   ├── ProjectRequest
│   ├── ScheduleActivityRequest
│   ├── ProgressReportRequest
│   ├── ExtractedEventResponse
│   ├── ActivityMatchResponse
│   ├── ReviewRequest
│   └── DashboardResponse
│
├── enums/
│   ├── UserRole
│   ├── ActivityLevel
│   ├── ActivityStatus
│   ├── MatchStatus
│   └── ProcessingStatus
│
└── exception/
    ├── ResourceNotFoundException
    └── GlobalExceptionHandler
