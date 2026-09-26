# 🎓 ProJSetu — Student Project Sanction & Allocation Dashboard

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Architecture](https://img.shields.io/badge/Architecture-REST%20%7C%20MVC%20%7C%203NF-purple.svg)](#)

> **ProJSetu** (*Project Bridge*) is a centralized, role-based academic portal designed to streamline capstone project workflows in engineering colleges. It replaces manual Excel tracking, unorganized communication channels, and paper sign-offs with a secure, automated management system.

---

## 📌 Problem Statement
In university engineering departments, final-year project coordination often suffers from:
- **Disorganized Team Formation:** Managing member caps, duplicate join requests, and scattered teams manually.
- **Untracked Project Proposals:** Losing proposal documents and synopsis PDFs across messaging apps and emails.
- **Faculty Guide Over-Allocation:** Lack of transparency in balancing mentoring loads across faculty members.
- **Department Isolation Gaps:** Preventing coordinators from accidentally interfering with students or faculty from other branches.

---

## 🚀 Key Modules & Implemented Features

### 1. 🔐 Role-Based Authentication & Smart Dynamic Routing
- **Secure Registration:** Validates email format, password complexity (min 8 chars, 1 digit, 1 special character), and whitelisted engineering branches (`ETC`, `CSE`, `MECH`, `CIVIL`, etc.).
- **BCrypt Password Hashing:** Zero plain-text passwords stored.
- **Smart Role-Based Routing:** Automatically detects whether an authenticated user is a **Student** or **Coordinator** and delivers them to their respective dashboard (`dashboard.html` or `coordinator.html`).
- **Session Management:** HTTP servlet session-based state protection.

### 2. 👥 Collaborative Team Lifecycle
- **Unique Team Code Generation:** Collision-resistant 8-character alphanumeric code generator (`createTeamCode()`).
- **Strict Capacity Enforcements:** Automatic 4-member limit per team.
- **Leader Approval Workflow:** Prospective members enter team codes; team leaders inspect applicants and approve/reject pending join requests in real time.

### 3. 📋 Project Proposal & Synopsis Submission
- **Multipart Document Uploads:** Teams submit project titles, detailed abstracts, and official PDF synopsis files.
- **Quota Enforcements:** Strict limit of maximum 3 proposals per team.
- **File System & DB Synchronization:** Deleting a proposal removes both the database record and the physical PDF from disk storage.

### 4. 🏛️ Department-Isolated Coordinator Module
- **Strict Tenant / Department Isolation:** An ETC Coordinator is strictly sandboxed to view, manage, and assign **only ETC students and ETC faculty guides**. Cross-department actions are forbidden (`403 FORBIDDEN`).
- **3NF Normalized JPQL Queries:** Unassigned teams are queried dynamically by joining through team leaders without denormalizing or polluting the `teams` table.
- **Faculty Workload Transparency:** Real-time visibility into the exact number of teams each faculty member is currently mentoring (`Prof. Name - X teams assigned`).
- **Atomic Allocations:** Multi-entity persistence protected with `@Transactional`.

### 5. 🌱 Automated Database Seeding Engine
- Built-in `CommandLineRunner` (`DataSeeder.java`) that pre-provisions department coordinators and faculty guides automatically on application boot with encrypted BCrypt credentials.
- 100% **Idempotent**—safely runs on every startup without generating duplicate records.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend** | Java 17, Spring Boot 3.5, Spring Security Crypto (`BCryptPasswordEncoder`) |
| **ORM / Persistence** | Spring Data JPA, Hibernate, JPQL |
| **Database** | MySQL 8.0 (Table-per-Type shared primary key hierarchy) |
| **Frontend** | HTML5, CSS3 (Custom Design System, Glassmorphic Modals), Vanilla ES6 JavaScript (`fetch` API) |
| **Build & Tooling** | Apache Maven, Postman |

---

## 📂 Project Architecture & System Design

### 1. High-Level Multi-Tier Flow

```
       [ Web Browser / Client ]
  (HTML5 + CSS3 + Vanilla ES6 JS)
                 │
                 │ JSON / REST API Requests (Fetch)
                 ▼
 ┌────────────────────────────────────────────────────────┐
 │            SPRING BOOT CONTROLLER LAYER                │
 │  • UserController      • TeamController                │
 │  • ProjectController   • CoordinatorController         │
 └───────────────────────┬────────────────────────────────┘
                         │ DTOs (Data Transfer Objects)
                         ▼
 ┌────────────────────────────────────────────────────────┐
 │                 SERVICE BUSINESS LAYER                 │
 │  • UserService         • TeamService                   │
 │  • ProjectService      • CoordinatorService            │
 │  (Guard Clauses, Validations & @Transactional Bounds)  │
 └───────────────────────┬────────────────────────────────┘
                         │ Entity Operations & JPQL
                         ▼
 ┌────────────────────────────────────────────────────────┐
 │               SPRING DATA JPA REPOSITORIES             │
 │  • UserRepository      • TeamRepository                │
 │  • GuideRepository     • CoordinatorRepository         │
 │  • StudentRepository   • ProposalRepository            │
 └───────────────────────┬────────────────────────────────┘
                         │ SQL Queries
                         ▼
 ┌────────────────────────────────────────────────────────┐
 │                  MySQL DATABASE (3NF)                  │
 │   users, teams, students, coordinators, guides,        │
 │   join_requests, project_proposals                     │
 └────────────────────────────────────────────────────────┘
```

### 2. Architectural Design Patterns Applied
- **Layered / N-Tier Architecture:** Complete separation of concerns between HTTP presentation (`controller`), business rules (`service`), and persistence (`repository`).
- **Data Transfer Object (DTO) Pattern:** Ensures internal database entity structures are never leaked raw over network endpoints.
- **Table-per-Type (TPT) Relational Inheritance:** Master `users` table holds authentication and department identity; specialized role tables (`students`, `coordinators`, `guides`) share the Primary Key as a Foreign Key.
- **Idempotent Database Seeding:** The `DataSeeder` (`CommandLineRunner`) guarantees that database provisioning executes safely on startup without duplicate key violations.
- **3NF Normalized JPQL Projections:** Avoids redundant columns by resolving team departments dynamically through team leader references.

### 3. Directory Structure

```
src/main/java/com/pavanwagh/dashboard/
├── config/         # Database seeders & application configs
├── controller/     # REST Endpoints (User, Team, Project, Coordinator)
├── dto/            # Data Transfer Objects (Requests & Responses)
├── entity/         # Relational entities (User, Student, Guide, Coordinator, Team, Proposal)
├── enums/          # RoleEnum, BranchEnum, ProposalStatus, RequestStatus
├── repository/     # Spring Data JPA repositories with custom JPQL queries
└── service/        # Core business rules, validation guards & transactions

src/main/resources/
├── static/         # Frontend web portal
│   ├── css/        # Modular styling tokens, card lighting & modal animations
│   ├── js/         # DOM event controllers and REST API consumers
│   ├── coordinator.html
│   ├── dashboard.html
│   ├── my-team.html
│   ├── my-project.html
│   └── login.html
└── application.properties
```

---

## 🔌 Core API Endpoints

### Authentication & User Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/users/registration` | Register a new student account |
| `POST` | `/users/login` | Authenticate user and initiate session |
| `GET` | `/users/me` | Fetch active logged-in user profile |
| `POST` | `/users/logout` | Invalidate session |

### Team Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/my_team/create` | Create a new team with unique code |
| `POST` | `/my_team/join` | Request to join a team via team code |
| `POST` | `/my_team/get_join_request_list` | Fetch pending join requests for leader |
| `POST` | `/my_team/respond_to_join_request` | Accept or reject join request |
| `GET` | `/my_team/details` | Retrieve team roster and leader details |

### Project Proposals
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/project/submit_proposal` | Upload project synopsis PDF & proposal details |
| `GET` | `/project/my_proposals` | List team's submitted proposals |
| `DELETE` | `/project/delete_proposal/{id}` | Delete proposal and purge physical PDF |

### Coordinator Operations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/coordinator/get_unassigned_teams` | Fetch unassigned teams in coordinator's department |
| `GET` | `/coordinator/guides` | Fetch department faculty with workload count |
| `POST` | `/coordinator/assign_guide` | Assign a guide to a team with department checks |

---

## ⚙️ How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Pavanwagh7/student-project-sanction-dashboard.git
```

### 2. Configure Database
Create a MySQL database named `project_dashboard` and set your credentials in:
`src/main/resources/application.properties` (Creat application.properties file in provided path and add you database configuration as follows)
```properties
spring.application.name=dashboard
spring.datasource.url=jdbc:mysql://localhost:3306/project_dashboard
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

### 3. Run the Application
Run `DashboardApplication.java` from IntelliJ IDEA or via Maven:
```bash
./mvnw spring-boot:run
```

### 4. Access the Portal
Open your browser and navigate to:
```
http://localhost:8080/login.html
```

---

## 👨‍💻 Author
**Pavan Wagh**  
*R. C. Patel Institute of Technology (RCPIT)*
