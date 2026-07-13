# SecureSDLC-Lab

This project helped me learn how Secure SDLC works in a real development workflow.

The application is intentionally simple because the main focus was learning security, not building a complete product.

The goal was to understand how security checks can be automated in a CI/CD pipeline and how common security issues can be fixed before code is merged.

---

## What I built

- Simple Node.js application
- GitHub Actions pipeline
- STRIDE threat model
- Secret scanning
- SAST
- SCA
- Docker image scanning
- Dockerfile scanning
- Kubernetes manifest scanning
- OWASP ZAP DAST
- Session-based authentication
- RBAC
- bcrypt password hashing
- Security headers using Helmet

---

## Tech Stack

Application

- Node.js
- Express
- SQLite

Security

- bcrypt
- Helmet
- express-session

DevSecOps

- GitHub Actions
- Docker
- Kubernetes

Security Tools

- Gitleaks
- Semgrep
- Trivy
- OWASP ZAP

---

## Pipeline

Every push and pull request runs these checks.

- Secret Scan (Gitleaks)
- SAST (Semgrep)
- Dependency Scan (Trivy)
- Docker Image Scan (Trivy)
- Docker & Kubernetes Config Scan (Trivy)
- DAST (OWASP ZAP)

The pull request should pass all checks before it is merged.

---

## Security Improvements

During this project I fixed several security issues.

### Password Storage

Passwords are stored using bcrypt instead of plaintext.

### SQL Injection

The login query uses parameterized queries.

### Authentication

- Session-based authentication
- Session regeneration after login
- HttpOnly cookies

### Authorization

RBAC was added so only admins can access the admin page.

### Secrets

Secrets are loaded from environment variables instead of hardcoding them.

### Security Headers

Helmet is used to add common HTTP security headers.

### Docker

- Non-root container
- Image scanned using Trivy

### Kubernetes

The deployment was updated with:

- runAsNonRoot
- readOnlyRootFilesystem
- Dropped capabilities
- Seccomp profile
- Resource limits

---

## Running the Project

Clone the repository.

```bash
git clone https://github.com/LocxZ/SecureSDLC-Lab.git
```

Install packages.

```bash
npm install
```

Run the application.

Linux

```bash
export SESSION_SECRET=my-secret
node app.js
```
Open

```
http://localhost:3000
```

---

## Default Users

Admin

```
admin
admin123
```

User

```
user
user123
```

---

## Screenshots

- GitHub Actions
<img width="332" height="309" alt="image" src="https://github.com/user-attachments/assets/82803b8d-e286-4d80-8dfa-28caacaa3610" />


- Threat Model
<img width="1536" height="1024" alt="threat_model" src="https://github.com/user-attachments/assets/ec0c65f7-6d57-4380-a3eb-b4e366acda4e" />


- Semgrep
<img width="1229" height="563" alt="image" src="https://github.com/user-attachments/assets/a0994690-fb9a-4e2d-b714-71ffb0394862" />

- Trivy
<img width="1109" height="585" alt="image" src="https://github.com/user-attachments/assets/0284e5f1-a221-4594-aaa8-57c75d658158" />

- OWASP ZAP
<img width="1413" height="637" alt="image" src="https://github.com/user-attachments/assets/6f62a787-8b9e-495e-be47-b2f5ef9a50f1" />

- Application
<img width="598" height="285" alt="image" src="https://github.com/user-attachments/assets/0718e65f-5993-4193-88aa-24ae7bc87d94" />

---

## What I learned

Before this project I mostly worked with DAST.

This project helped me understand how different security checks fit into the software development lifecycle.

I also learned how to automate these checks using GitHub Actions instead of running them manually.

---

## Future Work

Some things I would like to add later.

- Rate limiting
- Redis session store
- CSRF protection
- Terraform
- Helm
- Persistent storage for Kubernetes

---

## Note

This project was built for learning Secure SDLC concepts. It is not intended to be a production-ready application.
