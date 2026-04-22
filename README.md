# 🎓 Student Project Sanction Dashboard

🚧 Project under active development

Spring Boot-based system for managing student project approvals, guide assignments, and workflow in colleges.

---

## 📌 Overview
This project is a backend system built using Spring Boot to manage student project approvals in a college.

It aims to replace manual processes like Excel tracking and WhatsApp communication with a structured and scalable system.

---

## 🚀 Features (Current)
- User Login System
- Role-based structure (Student / Guide / Coordinator)
- Backend API for authentication

---

## 🛠️ Tech Stack
- Java
- Spring Boot
- Spring Data JPA
- MySQL (planned)

---

## 📂 Project Structure
```
src/
├── controller/
├── service/
├── repository/
├── entity/
```

---

## 🔐 API Endpoints

### Login API
```
GET /users/login?email=example@gmail.com&password=1234
```

Response:
- "Login Successfully"
- "Invalid Email or Password"

---

## ⚙️ How to Run

1. Clone the repository
```
git clone <your-repo-link>
```

2. Open in IntelliJ IDEA

3. Run:
```
DashboardApplication.java
```

4. Open browser:
```
http://localhost:8080/users/login?email=test@gmail.com&password=1234
```

---

## 🧠 Future Scope
- User Registration System
- Project Submission Module
- Guide Assignment System
- Role-based Dashboards
- Email Notifications

---

## 👨‍💻 Author
Pavan Wagh
