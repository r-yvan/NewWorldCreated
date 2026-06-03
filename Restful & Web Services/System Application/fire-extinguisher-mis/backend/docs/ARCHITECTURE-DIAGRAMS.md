# FEMS Architecture Diagrams (Mermaid)

This document contains Mermaid diagrams for the Fire Extinguisher Management System (FEMS) microservices architecture.

---

## 1. System Architecture Overview (C4 Context Level)

```mermaid
C4Context
    title System Context Diagram - Fire Extinguisher Management System

    Person(admin, "Admin", "System administrator managing users and compliance")
    Person(inspector, "Inspector", "Field inspector performing inspections and maintenance")
    Person(user, "User", "Standard user viewing extinguisher data")
    
    System(fems, "FEMS", "Fire Extinguisher Management System - Microservices Architecture")
    
    System_Ext(email, "Email Service", "Sends password reset emails")
    System_Ext(pdfGen, "PDF Generator", "Generates compliance reports")
    
    Rel(admin, fems, "Manages system", "HTTPS/REST")
    Rel(inspector, fems, "Performs inspections", "HTTPS/REST")
    Rel(user, fems, "Views extinguisher data", "HTTPS/REST")
    
    Rel(fems, email, "Sends emails", "SMTP")
    Rel(fems, pdfGen, "Generates reports", "Internal")
```

---

## 2. Microservices Architecture (Container Level)

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile App]
        POSTMAN[Postman/API Client]
    end
    
    subgraph "API Gateway Layer - Port 5000"
        GATEWAY[API Gateway<br/>- Routing<br/>- CORS<br/>- Rate Limiting<br/>- Health Checks]
    end
    
    subgraph "Microservices Layer"
        AUTH[Auth Service<br/>Port 5001<br/>- Login/Register<br/>- JWT Management<br/>- Password Reset]
        
        USER[User Service<br/>Port 5002<br/>- User CRUD<br/>- Profile Management<br/>- Role Management]
        
        EXT[Extinguisher Service<br/>Port 5003<br/>- Extinguisher CRUD<br/>- Status Tracking<br/>- Location Management]
        
        INSP[Inspection Service<br/>Port 5004<br/>- Inspection Scheduling<br/>- Inspector Assignment<br/>- Status Recording]
        
        MAINT[Maintenance Service<br/>Port 5005<br/>- Maintenance Logs<br/>- Cost Tracking<br/>- History]
        
        REPORT[Reporting Service<br/>Port 5006<br/>- Dashboard Stats<br/>- PDF/CSV Export<br/>- Analytics]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Shared Database<br/>fems-db)]
    end
    
    WEB --> GATEWAY
    MOBILE --> GATEWAY
    POSTMAN --> GATEWAY
    
    GATEWAY --> AUTH
    GATEWAY --> USER
    GATEWAY --> EXT
    GATEWAY --> INSP
    GATEWAY --> MAINT
    GATEWAY --> REPORT
    
    AUTH --> DB
    USER --> DB
    EXT --> DB
    INSP --> DB
    MAINT --> DB
    REPORT --> DB
    
    style GATEWAY fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style AUTH fill:#2196F3,stroke:#1565C0,color:#fff
    style USER fill:#2196F3,stroke:#1565C0,color:#fff
    style EXT fill:#2196F3,stroke:#1565C0,color:#fff
    style INSP fill:#2196F3,stroke:#1565C0,color:#fff
    style MAINT fill:#2196F3,stroke:#1565C0,color:#fff
    style REPORT fill:#2196F3,stroke:#1565C0,color:#fff
    style DB fill:#FF9800,stroke:#E65100,color:#fff
```

---

## 3. API Gateway Routing

```mermaid
flowchart LR
    CLIENT[Client Request]
    GATEWAY{API Gateway<br/>:5000}
    
    AUTH[Auth Service<br/>:5001]
    USER[User Service<br/>:5002]
    EXT[Extinguisher Service<br/>:5003]
    INSP[Inspection Service<br/>:5004]
    MAINT[Maintenance Service<br/>:5005]
    REPORT[Reporting Service<br/>:5006]
    
    CLIENT -->|/api/*| GATEWAY
    
    GATEWAY -->|/api/auth/*| AUTH
    GATEWAY -->|/api/users/*| USER
    GATEWAY -->|/api/extinguishers/*| EXT
    GATEWAY -->|/api/inspections/*| INSP
    GATEWAY -->|/api/maintenance/*| MAINT
    GATEWAY -->|/api/reports/*| REPORT
    
    AUTH -->|Response| GATEWAY
    USER -->|Response| GATEWAY
    EXT -->|Response| GATEWAY
    INSP -->|Response| GATEWAY
    MAINT -->|Response| GATEWAY
    REPORT -->|Response| GATEWAY
    
    GATEWAY -->|Response| CLIENT
    
    style GATEWAY fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
```

---

## 4. Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant DB as PostgreSQL
    
    Client->>Gateway: POST /api/auth/login<br/>{email, password}
    Gateway->>Auth: Forward request
    Auth->>DB: Query user by email
    DB-->>Auth: User data
    Auth->>Auth: Verify password (bcrypt)
    Auth->>Auth: Generate JWT tokens
    Auth->>DB: Store refresh token
    DB-->>Auth: Token stored
    Auth-->>Gateway: {accessToken, refreshToken, user}
    Gateway-->>Client: 200 OK + tokens
    
    Note over Client: Store tokens locally
    
    Client->>Gateway: GET /api/extinguishers<br/>Authorization: Bearer <token>
    Gateway->>Gateway: Forward with Authorization header
    Gateway->>Auth: Validate token
    Auth-->>Gateway: Token valid
    Gateway-->>Client: 200 OK + data
    
    Note over Client: Access token expires
    
    Client->>Gateway: POST /api/auth/refresh-token<br/>{refreshToken}
    Gateway->>Auth: Forward request
    Auth->>DB: Verify refresh token
    DB-->>Auth: Token valid
    Auth->>Auth: Generate new access token
    Auth->>Auth: Rotate refresh token
    Auth->>DB: Update refresh token
    Auth-->>Gateway: {accessToken, refreshToken}
    Gateway-->>Client: 200 OK + new tokens
```

---

## 5. Database Entity Relationships

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : has
    USERS ||--o{ PASSWORD_RESET_TOKENS : requests
    USERS ||--o{ INSPECTIONS : performs
    USERS ||--o{ MAINTENANCE : performs
    USERS ||--o{ AUDIT_LOGS : creates
    
    EXTINGUISHERS ||--o{ INSPECTIONS : has
    EXTINGUISHERS ||--o{ MAINTENANCE : receives
    
    USERS {
        uuid id PK
        string firstName
        string lastName
        string email UK
        string passwordHash
        enum role
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    REFRESH_TOKENS {
        uuid id PK
        string token UK
        uuid userId FK
        timestamp expiresAt
        boolean revoked
        timestamp createdAt
    }
    
    PASSWORD_RESET_TOKENS {
        uuid id PK
        string token UK
        uuid userId FK
        timestamp expiresAt
        boolean used
        timestamp createdAt
    }
    
    EXTINGUISHERS {
        uuid id PK
        string serialNumber UK
        string location
        enum type
        enum size
        date installationDate
        date expiryDate
        enum status
        timestamp createdAt
        timestamp updatedAt
    }
    
    INSPECTIONS {
        uuid id PK
        uuid extinguisherId FK
        date scheduledDate
        string scheduledTime
        uuid inspectorId FK
        enum status
        text notes
        timestamp createdAt
        timestamp updatedAt
    }
    
    MAINTENANCE {
        uuid id PK
        uuid extinguisherId FK
        uuid inspectorId FK
        text actionTaken
        text conditionNotes
        timestamp maintenanceDate
        timestamp createdAt
        timestamp updatedAt
    }
    
    AUDIT_LOGS {
        uuid id PK
        uuid userId FK
        string action
        string entity
        string entityId
        json metadata
        timestamp createdAt
    }
```

---

## 6. Request Flow with RBAC

```mermaid
flowchart TD
    START([Client Request])
    GATEWAY[API Gateway]
    ROUTE{Route Request}
    SERVICE[Target Microservice]
    AUTH_CHECK{JWT Valid?}
    RBAC_CHECK{Has Permission?}
    PROCESS[Process Business Logic]
    DB[(Database)]
    RESPONSE([Return Response])
    ERROR_401([401 Unauthorized])
    ERROR_403([403 Forbidden])
    
    START --> GATEWAY
    GATEWAY --> ROUTE
    
    ROUTE -->|/api/auth/*| SERVICE
    ROUTE -->|/api/users/*| SERVICE
    ROUTE -->|/api/extinguishers/*| SERVICE
    ROUTE -->|/api/inspections/*| SERVICE
    ROUTE -->|/api/maintenance/*| SERVICE
    ROUTE -->|/api/reports/*| SERVICE
    
    SERVICE --> AUTH_CHECK
    AUTH_CHECK -->|Invalid/Missing| ERROR_401
    AUTH_CHECK -->|Valid| RBAC_CHECK
    
    RBAC_CHECK -->|Insufficient Role| ERROR_403
    RBAC_CHECK -->|Authorized| PROCESS
    
    PROCESS --> DB
    DB --> PROCESS
    PROCESS --> RESPONSE
    
    ERROR_401 --> GATEWAY
    ERROR_403 --> GATEWAY
    RESPONSE --> GATEWAY
    GATEWAY --> START
    
    style START fill:#9E9E9E,stroke:#424242,color:#fff
    style GATEWAY fill:#4CAF50,stroke:#2E7D32,color:#fff
    style SERVICE fill:#2196F3,stroke:#1565C0,color:#fff
    style DB fill:#FF9800,stroke:#E65100,color:#fff
    style RESPONSE fill:#4CAF50,stroke:#2E7D32,color:#fff
    style ERROR_401 fill:#F44336,stroke:#C62828,color:#fff
    style ERROR_403 fill:#F44336,stroke:#C62828,color:#fff
```

---

## 7. Docker Compose Deployment

```mermaid
graph TB
    subgraph "Docker Network: fems-network"
        subgraph "Database Container"
            POSTGRES[PostgreSQL<br/>Container: fems-postgres<br/>Port: 5432<br/>Volume: fems_pgdata]
        end
        
        subgraph "Microservices Containers"
            AUTH_C[Auth Service<br/>Container: fems-auth-service<br/>Port: 5001]
            USER_C[User Service<br/>Container: fems-user-service<br/>Port: 5002]
            EXT_C[Extinguisher Service<br/>Container: fems-extinguisher-service<br/>Port: 5003]
            INSP_C[Inspection Service<br/>Container: fems-inspection-service<br/>Port: 5004]
            MAINT_C[Maintenance Service<br/>Container: fems-maintenance-service<br/>Port: 5005]
            REPORT_C[Reporting Service<br/>Container: fems-reporting-service<br/>Port: 5006<br/>Volume: fems_exports]
        end
        
        subgraph "Gateway Container"
            GATEWAY_C[API Gateway<br/>Container: fems-api-gateway<br/>Port: 5000<br/>Exposed to Host]
        end
        
        POSTGRES -->|Health Check| AUTH_C
        POSTGRES -->|Health Check| USER_C
        POSTGRES -->|Health Check| EXT_C
        POSTGRES -->|Health Check| INSP_C
        POSTGRES -->|Health Check| MAINT_C
        POSTGRES -->|Health Check| REPORT_C
        
        AUTH_C -->|Health Check| GATEWAY_C
        USER_C -->|Health Check| GATEWAY_C
        EXT_C -->|Health Check| GATEWAY_C
        INSP_C -->|Health Check| GATEWAY_C
        MAINT_C -->|Health Check| GATEWAY_C
        REPORT_C -->|Health Check| GATEWAY_C
    end
    
    HOST[Host Machine<br/>localhost:5000]
    HOST -.->|Port Mapping| GATEWAY_C
    
    style POSTGRES fill:#FF9800,stroke:#E65100,color:#fff
    style GATEWAY_C fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style AUTH_C fill:#2196F3,stroke:#1565C0,color:#fff
    style USER_C fill:#2196F3,stroke:#1565C0,color:#fff
    style EXT_C fill:#2196F3,stroke:#1565C0,color:#fff
    style INSP_C fill:#2196F3,stroke:#1565C0,color:#fff
    style MAINT_C fill:#2196F3,stroke:#1565C0,color:#fff
    style REPORT_C fill:#2196F3,stroke:#1565C0,color:#fff
```

---

## 8. Service Internal Architecture (Example: Extinguisher Service)

```mermaid
flowchart TB
    subgraph "Extinguisher Service Container"
        ROUTER[Router<br/>/api/extinguishers]
        
        subgraph "Middleware Layer"
            AUTH_MW[Auth Middleware<br/>JWT Verification]
            VALIDATE_MW[Validation Middleware<br/>Zod Schemas]
            RBAC_MW[RBAC Middleware<br/>Permission Check]
        end
        
        CONTROLLER[Controller<br/>Request/Response Handling]
        SERVICE[Service Layer<br/>Business Logic]
        REPOSITORY[Repository Layer<br/>Database Access]
        PRISMA[Prisma Client]
    end
    
    REQUEST([Incoming Request])
    DB[(PostgreSQL)]
    RESPONSE([Response])
    
    REQUEST --> ROUTER
    ROUTER --> AUTH_MW
    AUTH_MW --> VALIDATE_MW
    VALIDATE_MW --> RBAC_MW
    RBAC_MW --> CONTROLLER
    CONTROLLER --> SERVICE
    SERVICE --> REPOSITORY
    REPOSITORY --> PRISMA
    PRISMA --> DB
    DB --> PRISMA
    PRISMA --> REPOSITORY
    REPOSITORY --> SERVICE
    SERVICE --> CONTROLLER
    CONTROLLER --> RESPONSE
    
    style ROUTER fill:#4CAF50,stroke:#2E7D32,color:#fff
    style CONTROLLER fill:#2196F3,stroke:#1565C0,color:#fff
    style SERVICE fill:#2196F3,stroke:#1565C0,color:#fff
    style REPOSITORY fill:#2196F3,stroke:#1565C0,color:#fff
    style PRISMA fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style DB fill:#FF9800,stroke:#E65100,color:#fff
```

---

## 9. Reporting Service Data Flow

```mermaid
sequenceDiagram
    participant Client
    participant Gateway
    participant Reporting as Reporting Service
    participant DB as PostgreSQL
    participant PDF as PDF Generator
    participant FS as File System
    
    Client->>Gateway: GET /api/reports/dashboard
    Gateway->>Reporting: Forward request
    Reporting->>DB: Query aggregate statistics
    DB-->>Reporting: Return stats
    Reporting-->>Gateway: Dashboard data (JSON)
    Gateway-->>Client: 200 OK + data
    
    Note over Client: Request PDF export
    
    Client->>Gateway: POST /api/reports/export/pdf
    Gateway->>Reporting: Forward request
    Reporting->>DB: Query detailed data
    DB-->>Reporting: Return records
    Reporting->>PDF: Generate PDF document
    PDF-->>Reporting: PDF buffer
    Reporting->>FS: Save to /app/tmp/exports
    FS-->>Reporting: File saved
    Reporting-->>Gateway: {downloadUrl: "/api/reports/download/report-123.pdf"}
    Gateway-->>Client: 200 OK + download URL
    
    Note over Client: Download generated file
    
    Client->>Gateway: GET /api/reports/download/report-123.pdf
    Gateway->>Reporting: Forward request
    Reporting->>FS: Read file
    FS-->>Reporting: File stream
    Reporting-->>Gateway: PDF file stream
    Gateway-->>Client: 200 OK + PDF file
```

---

## 10. Deployment Architecture

```mermaid
C4Deployment
    title Deployment Diagram - FEMS Production Environment
    
    Deployment_Node(client, "Client Device", "Browser/Mobile"){
        Container(web, "Web Application", "React/Vue", "User interface")
    }
    
    Deployment_Node(docker, "Docker Host", "Ubuntu Server"){
        Deployment_Node(gateway_container, "API Gateway Container", "Docker"){
            Container(gateway, "API Gateway", "Node.js/Express", "Routes requests")
        }
        
        Deployment_Node(services, "Microservices Containers", "Docker"){
            Container(auth, "Auth Service", "Node.js", "Authentication")
            Container(user, "User Service", "Node.js", "User management")
            Container(ext, "Extinguisher Service", "Node.js", "Extinguisher data")
            Container(insp, "Inspection Service", "Node.js", "Inspections")
            Container(maint, "Maintenance Service", "Node.js", "Maintenance logs")
            Container(report, "Reporting Service", "Node.js", "Reports & exports")
        }
        
        Deployment_Node(db_container, "Database Container", "Docker"){
            ContainerDb(db, "PostgreSQL", "PostgreSQL 16", "Shared database")
        }
    }
    
    Rel(web, gateway, "HTTPS", "REST API")
    Rel(gateway, auth, "HTTP", "Internal")
    Rel(gateway, user, "HTTP", "Internal")
    Rel(gateway, ext, "HTTP", "Internal")
    Rel(gateway, insp, "HTTP", "Internal")
    Rel(gateway, maint, "HTTP", "Internal")
    Rel(gateway, report, "HTTP", "Internal")
    Rel(auth, db, "TCP", "5432")
    Rel(user, db, "TCP", "5432")
    Rel(ext, db, "TCP", "5432")
    Rel(insp, db, "TCP", "5432")
    Rel(maint, db, "TCP", "5432")
    Rel(report, db, "TCP", "5432")
```

---

## How to Use These Diagrams

### For dbdiagram.io (Database Diagram)
1. Go to https://dbdiagram.io
2. Copy the content from `DATABASE-DIAGRAM.dbml`
3. Paste into the dbdiagram.io editor
4. The ER diagram will be generated automatically
5. Export as PNG, PDF, or share the link

### For Mermaid Diagrams
These diagrams can be rendered in:
- **GitHub**: Paste into README.md (GitHub natively supports Mermaid)
- **GitLab**: Paste into any .md file
- **VS Code**: Install "Markdown Preview Mermaid Support" extension
- **Mermaid Live Editor**: https://mermaid.live
- **Documentation Sites**: Docusaurus, MkDocs, etc.

### Exporting Diagrams
- **Mermaid Live Editor**: Export as PNG/SVG
- **VS Code**: Right-click diagram → Export
- **Command Line**: Use `mmdc` (mermaid-cli) to generate images

---

## Architecture Highlights

### Microservices Benefits
- **Independent Scaling**: Each service can scale based on load
- **Technology Freedom**: Services can use different libraries/patterns
- **Fault Isolation**: One service failure doesn't crash the system
- **Team Autonomy**: Teams can own services end-to-end
- **Clear Boundaries**: Domain-driven service separation

### Shared Database Approach
- **Simplified Deployment**: No distributed transaction complexity
- **Data Consistency**: ACID guarantees at database level
- **Straightforward Migrations**: Single schema to manage
- **Future Evolution**: Can migrate to separate databases if needed

### API Gateway Pattern
- **Single Entry Point**: Centralized security and routing
- **Cross-Cutting Concerns**: CORS, rate limiting, logging at edge
- **Service Discovery**: Gateway knows all service locations
- **Client Simplification**: Clients only need one endpoint

---

## Related Documentation
- [MICROSERVICES.md](../MICROSERVICES.md) - Detailed architecture guide
- [MIGRATION-COMPLETE.md](../MIGRATION-COMPLETE.md) - Migration summary
- [DATABASE-DIAGRAM.dbml](./DATABASE-DIAGRAM.dbml) - Database schema for dbdiagram.io
- [README.md](../README.md) - Project overview and setup
