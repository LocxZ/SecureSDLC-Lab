# TaskFlow Threat Model

## 1. System Overview

TaskFlow is a Node.js and Express web application running inside a Docker container.

The application provides a login interface and stores user credentials in a SQLite database.

The project uses GitHub Actions for automated security checks before code is merged into the main branch.

## 2. Components

- User Browser
- Express Web Application
- SQLite Database
- Docker Container
- GitHub Repository
- GitHub Actions CI/CD Runner

## 3. Data Flow

### Application Data Flow

User Browser
    |
    | Username and Password
    v
Express Application
    |
    | SQL Query
    v
SQLite Database

### Development Data Flow

Developer
    |
    | Git Push / Pull Request
    v
GitHub Repository
    |
    v
GitHub Actions Runner
    |
    | Security Scanning
    v
Merge to Main

## 4. Trust Boundaries

### TB-01: User Browser → Express Application

User-controlled HTTP requests enter the TaskFlow application.

All input received from the user must be considered untrusted.

### TB-02: Express Application → SQLite Database

The application sends SQL queries to the SQLite database.

User-controlled data may influence database operations if input is not handled securely.

### TB-03: GitHub Repository → GitHub Actions Runner

Repository code and workflow configuration are executed by the CI/CD runner.

Malicious code, secrets, vulnerable dependencies, or insecure workflow changes may affect the build and security pipeline.
## 5. STRIDE Threat Analysis

### S - Spoofing

#### TH-01: Attacker impersonates a valid user using stolen credentials

An attacker who obtains valid TaskFlow credentials may authenticate as another user.

**Affected Component:** Login functionality

**Trust Boundary:** TB-01

**Impact:** Unauthorized access to a user account.

**Security Requirements:**

- User passwords must not be stored in plaintext.
- Authentication failures must not reveal sensitive account information.
- Credentials must not be committed to the source repository.

**Security Controls:**

- Password hashing
- Generic authentication error messages
- Gitleaks secret scanning
### T - Tampering

#### TH-02: Security workflow modification to bypass CI/CD controls

A malicious or compromised developer may modify GitHub Actions workflow files to weaken or bypass security checks.

For example, changing a scanner failure policy may allow vulnerable code or container images to pass the CI/CD pipeline.

**Affected Component:** GitHub Actions CI/CD Pipeline

**Trust Boundary:** TB-03

**Impact:** Vulnerable or malicious code may be merged into the main branch.

**Security Requirements:**

- Security workflow changes must be reviewed before merging.
- Security checks must block pull requests when policy violations are detected.
- GitHub Actions dependencies must use immutable references.

**Security Controls:**

- Pull request reviews
- Required status checks
- Branch protection rules
- GitHub Actions pinned to full commit SHAs

### R - Repudiation

#### TH-03: Developer denies making or approving a security-sensitive change

A developer may make or approve a security-sensitive code or workflow change and later deny performing the action.

**Affected Component:** GitHub Repository and CI/CD Pipeline

**Trust Boundary:** TB-03

**Impact:** Security incidents may be difficult to investigate and attribute.

**Security Requirements:**

- Code changes must maintain an auditable history.
- Security-sensitive changes must be associated with pull requests and reviews.
- Direct changes to the main branch must be restricted.

**Security Controls:**

- Git commit history
- GitHub pull request history
- Pull request reviews
- Branch protection rules

### I - Information Disclosure

#### **Completed** TH-04: Plaintext user passwords are exposed through database compromise

TaskFlow stores user passwords in plaintext in the SQLite database.

An attacker who obtains access to the database file may directly read user credentials.

**Affected Component:** SQLite Database

**Trust Boundary:** TB-02

**Impact:** Exposure of user credentials and potential account compromise.

**Security Requirements:**

- User passwords must not be stored in plaintext.
- Passwords must be protected using a secure password hashing algorithm.
- Sensitive credentials must not be exposed through source code or repository history.

**Security Controls:**

- Password hashing
- Gitleaks secret scanning
- Restricted access to application data

**Remediation Status:** Implemented

**Implemented Control:**

- User passwords are hashed using bcrypt with a cost factor of 12.
- Authentication retrieves the user by username and verifies the submitted password using bcrypt comparison.
- Plaintext passwords are no longer stored in the SQLite database.


### D - Denial of Service

#### TH-05: Login endpoint exhaustion through excessive requests

An attacker may send a large number of requests to the TaskFlow login endpoint.

TaskFlow currently does not implement rate limiting, allowing excessive requests to consume application resources.

**Affected Component:** Express Application

**Trust Boundary:** TB-01

**Impact:** TaskFlow may become slow or unavailable to legitimate users.

**Security Requirements:**

- The application must limit excessive requests to authentication endpoints.
- Repeated login attempts must be controlled.

**Security Controls:**

- Rate limiting
- Request monitoring and logging

### E - Elevation of Privilege

#### TH-06: Normal user gains access to administrative functionality

An authenticated low-privileged user may attempt to access administrative functionality without proper authorization checks.

**Affected Component:** Express Application

**Trust Boundary:** TB-01

**Impact:** Unauthorized access to privileged application functionality.

**Security Requirements:**

- Authorization must be enforced on privileged functionality.
- User roles and permissions must be validated server-side.
- Authentication alone must not grant administrative access.

**Security Controls:**

- Role-Based Access Control (RBAC)
- Server-side authorization checks
- Authorization testing

## 6. Risk Prioritization

| Threat ID | Threat | Likelihood | Impact | Risk Score | Priority |
|---|---|---:|---:|---:|---|
| TH-01 | Stolen credentials used to impersonate a user | 2 | 3 | 6 | High |
| TH-02 | CI/CD security controls are tampered with | 2 | 3 | 6 | High |
| TH-03 | Developer denies a security-sensitive change | 1 | 2 | 2 | Low |
| TH-04 | Plaintext passwords exposed through database compromise | 3 | 3 | 9 | Critical |
| TH-05 | Login endpoint exhaustion through excessive requests | 2 | 2 | 4 | Medium |
| TH-06 | Low-privileged user accesses administrative functionality | 2 | 3 | 6 | High |

## 7. Remediation Priority

Based on the risk assessment, TaskFlow security improvements will be implemented in the following order:

1. TH-04 - Implement secure password hashing.
2. TH-06 - Implement server-side authorization and role-based access control.
3. TH-05 - Implement rate limiting on authentication endpoints.

Existing CI/CD controls already partially mitigate TH-01, TH-02, and TH-03.
