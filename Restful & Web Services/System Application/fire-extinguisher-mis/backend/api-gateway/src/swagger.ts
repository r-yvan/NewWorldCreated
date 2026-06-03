import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fire Extinguisher Management System (FEMS) API",
      version: "1.0.0",
      description: `
A production-ready RESTful API for managing fire extinguishers, inspections, maintenance, compliance reporting, and users.

**Architecture**: Microservices with API Gateway

**Authentication**: JWT Bearer tokens (access + refresh)

**Base URL**: \`/api\`

## Getting Started

1. **Register or Login**: Use \`POST /api/auth/login\` to obtain an access token
2. **Authorize**: Click the "Authorize" button and enter \`Bearer <your-access-token>\`
3. **Make Requests**: All authenticated endpoints require the JWT token

## Response Format

### Success Response
\`\`\`json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
\`\`\`

### Error Response
\`\`\`json
{
  "success": false,
  "message": "Error message",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
\`\`\`

### Pagination (List Endpoints)
\`\`\`json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
\`\`\`

## Authentication Flow

1. Login → Receive \`accessToken\` and \`refreshToken\`
2. Use \`accessToken\` in Authorization header: \`Bearer <token>\`
3. When access token expires, use \`POST /api/auth/refresh-token\` with refresh token
4. Logout → Invalidates refresh token

## Roles

- **ADMIN**: Full system access
- **INSPECTOR**: Can perform inspections, view extinguishers
- **USER**: Limited read access

## Query Parameters (List Endpoints)

- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 10)
- \`search\`: Search across relevant fields
- \`sortBy\`: Field to sort by
- \`sortOrder\`: \`asc\` or \`desc\`
- Additional filters vary by endpoint (e.g., \`status\`, \`type\`)
      `,
      contact: {
        name: "FEMS API Support",
        email: "support@fems.com",
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server (API Gateway)",
      },
      {
        url: "http://localhost:5001",
        description: "Auth Service (Direct - for debugging)",
      },
      {
        url: "http://localhost:5002",
        description: "User Service (Direct - for debugging)",
      },
      {
        url: "http://localhost:5003",
        description: "Extinguisher Service (Direct - for debugging)",
      },
      {
        url: "http://localhost:5004",
        description: "Inspection Service (Direct - for debugging)",
      },
      {
        url: "http://localhost:5005",
        description: "Maintenance Service (Direct - for debugging)",
      },
      {
        url: "http://localhost:5006",
        description: "Reporting Service (Direct - for debugging)",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and JWT token management",
      },
      {
        name: "Users",
        description: "User account management (CRUD, profiles, roles)",
      },
      {
        name: "Extinguishers",
        description: "Fire extinguisher registration and management",
      },
      {
        name: "Inspections",
        description: "Inspection records and scheduling",
      },
      {
        name: "Maintenance",
        description: "Maintenance history and tracking",
      },
      {
        name: "Reports",
        description: "Dashboard statistics and data exports (PDF/CSV)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token (without 'Bearer' prefix)",
        },
      },
      schemas: {
        // Common schemas
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "email" },
                  message: { type: "string", example: "Invalid email format" },
                },
              },
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            total: { type: "integer", example: 100 },
            pages: { type: "integer", example: 10 },
          },
        },
        // Auth schemas
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "admin@fems.com" },
            password: { type: "string", format: "password", example: "Admin@123" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Login successful" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
              },
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "firstName", "lastName", "role"],
          properties: {
            email: { type: "string", format: "email", example: "newuser@fems.com" },
            password: {
              type: "string",
              format: "password",
              example: "SecurePass@123",
              minLength: 8,
              description: "Must contain uppercase, lowercase, number, and special character",
            },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            role: { type: "string", enum: ["ADMIN", "INSPECTOR", "USER"], example: "USER" },
          },
        },
        RefreshTokenRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          },
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email", example: "admin@fems.com" },
          },
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["token", "newPassword"],
          properties: {
            token: { type: "string", example: "abc123resettoken" },
            newPassword: { type: "string", format: "password", example: "NewSecure@123" },
          },
        },
        // User schemas
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
            email: { type: "string", format: "email", example: "admin@fems.com" },
            firstName: { type: "string", example: "Admin" },
            lastName: { type: "string", example: "User" },
            role: { type: "string", enum: ["ADMIN", "INSPECTOR", "USER"], example: "ADMIN" },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        UserCreateRequest: {
          type: "object",
          required: ["email", "password", "firstName", "lastName", "role"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password", minLength: 8 },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string", enum: ["ADMIN", "INSPECTOR", "USER"] },
          },
        },
        UserUpdateRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string", enum: ["ADMIN", "INSPECTOR", "USER"] },
            isActive: { type: "boolean" },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string", format: "password" },
            newPassword: { type: "string", format: "password", minLength: 8 },
          },
        },
        // Extinguisher schemas
        Extinguisher: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            serialNumber: { type: "string", example: "EXT-2024-001" },
            type: { type: "string", enum: ["WATER", "FOAM", "CO2", "POWDER", "WET_CHEMICAL"], example: "CO2" },
            location: { type: "string", example: "Building A - Floor 1 - Room 101" },
            installationDate: { type: "string", format: "date", example: "2024-01-15" },
            expiryDate: { type: "string", format: "date", example: "2025-01-15" },
            lastInspectionDate: { type: "string", format: "date", nullable: true },
            status: {
              type: "string",
              enum: ["ACTIVE", "EXPIRED", "UNDER_MAINTENANCE", "RETIRED"],
              example: "ACTIVE",
            },
            capacity: { type: "number", example: 5, description: "Capacity in kg or liters" },
            manufacturer: { type: "string", example: "FireSafe Inc." },
            notes: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ExtinguisherCreateRequest: {
          type: "object",
          required: ["serialNumber", "type", "location", "installationDate", "expiryDate", "capacity"],
          properties: {
            serialNumber: { type: "string" },
            type: { type: "string", enum: ["WATER", "FOAM", "CO2", "POWDER", "WET_CHEMICAL"] },
            location: { type: "string" },
            installationDate: { type: "string", format: "date" },
            expiryDate: { type: "string", format: "date" },
            capacity: { type: "number" },
            manufacturer: { type: "string" },
            notes: { type: "string" },
          },
        },
        // Inspection schemas
        Inspection: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            extinguisherId: { type: "string", format: "uuid" },
            inspectorId: { type: "string", format: "uuid" },
            inspectionDate: { type: "string", format: "date-time" },
            status: { type: "string", enum: ["PASSED", "FAILED", "NEEDS_MAINTENANCE"], example: "PASSED" },
            notes: { type: "string", nullable: true },
            nextInspectionDate: { type: "string", format: "date", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            extinguisher: { $ref: "#/components/schemas/Extinguisher" },
            inspector: { $ref: "#/components/schemas/User" },
          },
        },
        InspectionCreateRequest: {
          type: "object",
          required: ["extinguisherId", "inspectionDate", "status"],
          properties: {
            extinguisherId: { type: "string", format: "uuid" },
            inspectionDate: { type: "string", format: "date-time" },
            status: { type: "string", enum: ["PASSED", "FAILED", "NEEDS_MAINTENANCE"] },
            notes: { type: "string" },
            nextInspectionDate: { type: "string", format: "date" },
          },
        },
        // Maintenance schemas
        Maintenance: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            extinguisherId: { type: "string", format: "uuid" },
            technicianId: { type: "string", format: "uuid" },
            maintenanceDate: { type: "string", format: "date-time" },
            description: { type: "string" },
            cost: { type: "number", format: "float", example: 150.50 },
            notes: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            extinguisher: { $ref: "#/components/schemas/Extinguisher" },
            technician: { $ref: "#/components/schemas/User" },
          },
        },
        MaintenanceCreateRequest: {
          type: "object",
          required: ["extinguisherId", "maintenanceDate", "description", "cost"],
          properties: {
            extinguisherId: { type: "string", format: "uuid" },
            maintenanceDate: { type: "string", format: "date-time" },
            description: { type: "string" },
            cost: { type: "number", format: "float" },
            notes: { type: "string" },
          },
        },
        // Report schemas
        DashboardStats: {
          type: "object",
          properties: {
            totalExtinguishers: { type: "integer", example: 150 },
            activeExtinguishers: { type: "integer", example: 135 },
            expiredExtinguishers: { type: "integer", example: 10 },
            underMaintenance: { type: "integer", example: 5 },
            totalInspections: { type: "integer", example: 450 },
            passedInspections: { type: "integer", example: 420 },
            failedInspections: { type: "integer", example: 30 },
            totalMaintenance: { type: "integer", example: 75 },
            totalMaintenanceCost: { type: "number", format: "float", example: 15000.50 },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Unauthorized - Invalid or missing JWT token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Unauthorized",
                errors: [{ message: "Invalid or expired token" }],
              },
            },
          },
        },
        Forbidden: {
          description: "Forbidden - Insufficient permissions",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Forbidden",
                errors: [{ message: "You do not have permission to perform this action" }],
              },
            },
          },
        },
        NotFound: {
          description: "Not Found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Resource not found",
                errors: [],
              },
            },
          },
        },
        ValidationError: {
          description: "Validation Error - Invalid input",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                success: false,
                message: "Validation failed",
                errors: [
                  { field: "email", message: "Invalid email format" },
                  { field: "password", message: "Password must be at least 8 characters" },
                ],
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/swagger-routes.ts"], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
