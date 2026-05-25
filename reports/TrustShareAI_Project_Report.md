---
title: "TrustShareAI - Intelligent Community Resource Sharing Platform"
subtitle: "Mini Project Report"
author: "Mallikarjun Miragi and Team"
date: "Academic Year 2025-2026"
---

# TrustShareAI - Intelligent Community Resource Sharing Platform

**Mini Project Report**

**Project Title:** TrustShareAI - Intelligent Community Resource Sharing Platform  
**Domain:** Full Stack Web Development, Community Sharing, Trust and Reputation Systems  
**Team Size:** Four Members  
**Student Name:** Mallikarjun Miragi  
**Institution:** RV University  
**Academic Year:** 2025-2026  

**Formatting note for final submission:** Use Times New Roman. Chapter heading font size: 16. Sub-heading font size: 14. Content font size: 12. Table and figure captions font size: 11, bold, center aligned. Content text should be justified.

\newpage

# Chapter 1

## 1.1 Introduction

TrustShareAI is an intelligent community resource sharing platform designed for closed communities such as hostels, apartments, campuses, and residential societies. The main idea of the project is to allow people within a trusted community to share physical items with one another without involving monetary transactions. Instead of purchasing rarely used items such as tools, books, chargers, sports equipment, appliances, or project materials, users can borrow them from nearby trusted members. This reduces unnecessary buying, encourages sustainable consumption, and strengthens collaboration among community members.

The platform provides a modern full-stack web application with user authentication, closed community invite codes, item listing, item browsing, borrow request workflow, ratings, credit points, admin controls, image uploads, email notifications, and a multi-parameter trust scoring engine. The system focuses on three major values: trust, sustainability, and community collaboration. The frontend is designed with a premium glassmorphism user interface inspired by Apple VisionOS and modern AI startup products, while the backend is built using Node.js, Express.js, MongoDB Atlas, JWT authentication, and Mongoose.

## 1.2 State of the Art

In the current digital ecosystem, sharing-based platforms such as Airbnb, Uber, library lending systems, and peer-to-peer marketplaces have shown that reputation and trust are essential for successful online collaboration. Traditional online marketplaces mostly depend on payments, ratings, and reviews. However, closed communities such as hostels and campuses require a slightly different approach because users already share a physical environment and interact repeatedly. In such environments, a system must focus not only on ratings but also on responsible behaviour, timely return, item care, community contribution, and misuse prevention.

The state-of-the-art development in trust-based platforms includes user authentication, reputation scoring, transaction history analysis, behavioural signals, anti-gaming mechanisms, and transparent explanations for calculated scores. TrustShareAI follows this direction by implementing a multi-parameter trust engine instead of a simple average rating model. The system uses signals such as punctuality, completion rate, received ratings, item care, contribution, diversity of interactions, verification status, responsiveness, and high-value item handling. This helps reduce score manipulation and provides a more reliable trust profile for each user.

## 1.3 Motivation

Many students and residents buy items that are used only a few times. For example, a student may buy a screwdriver, calculator, kettle, extension board, book, or lab accessory even when another person in the same hostel or campus already owns it. This leads to unnecessary spending, duplicated purchases, storage issues, and wastage of resources. At the same time, informal borrowing through WhatsApp groups or personal contacts can become difficult to manage because there is no structured record of who borrowed an item, when it should be returned, and whether the borrower has a trustworthy history.

The motivation behind TrustShareAI is to create a digital platform where community members can borrow instead of buying. The system encourages responsible sharing by rewarding good behaviour through credit points and badges. It also reduces trust concerns by showing trust scores, ratings, borrowing history, and transparent trust explanations. By combining community access control with an intelligent trust engine, the project aims to make sharing safe, convenient, and sustainable.

## 1.4 Problem Statement

People living in closed communities frequently need temporary access to physical items, but existing informal methods of borrowing are unorganized and lack accountability. There is no single system to list available items, request borrowing, approve or reject requests, track active borrows, record returns, calculate trust, reward responsible users, or identify risky behaviour. Simple rating-based trust can also be manipulated by fake or repeated ratings from the same users.

Therefore, the problem is to design and implement a secure, community-based resource sharing platform that enables users to list and borrow items within their community while maintaining accountability through borrow workflows, ratings, trust scoring, credit points, badges, and admin monitoring.

## 1.5 Objectives

The main objectives of TrustShareAI are:

1. To build a full-stack web application for sharing physical items inside closed communities.
2. To implement secure user registration and login using JWT and bcrypt password hashing.
3. To support closed community creation and joining using invite codes.
4. To allow users to list, browse, search, filter, and view item details.
5. To implement a borrow request workflow with pending, approved, active, rejected, and returned states.
6. To provide ratings and reviews after completed borrowing.
7. To design a multi-parameter trust scoring engine that is harder to manipulate than simple rating averages.
8. To implement a goodness or credit point system for responsible actions.
9. To provide dashboards for users and admins with analytics, trust history, and misuse monitoring.
10. To create a premium, responsive, glassmorphism-based user interface with smooth animations.
11. To integrate Cloudinary image upload for item images.
12. To integrate email notifications for important borrow request events.
13. To prepare an optional Python FastAPI microservice structure for future AI-based trust scoring.

## 1.6 Methodology

The methodologies used to build the project were:

A. Requirement Analysis and Community Modelling  
The requirements of a closed community resource sharing system were analysed. The main users, workflows, entities, and constraints were identified. The core entities selected were User, Community, Item, BorrowRequest, Rating, TrustEvent, and TrustHistory.

B. Data Processing and Trust Scoring  
User actions such as item listing, borrow approval, return status, ratings, late returns, and interaction diversity are stored in MongoDB. A rule-based multi-parameter trust engine processes these signals and calculates a trust score from 0 to 100. The trust calculation includes anti-gaming rules such as rating concentration penalties and history caps.

C. Web Application Development  
The frontend was developed using React, Vite, TailwindCSS, Framer Motion, and Lucide icons. The backend was developed using Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcrypt, Cloudinary, and Nodemailer. REST APIs were created for authentication, community management, item management, borrow requests, ratings, trust data, dashboard analytics, uploads, and admin actions.

D. Testing and Validation  
The system was tested using manual testing, unit-level route testing, integration testing between frontend and backend, and system testing with demo users and sample borrow histories. A demo dataset was created to test different trust behaviours such as timely returns, delayed returns, high ratings, low ratings, active requests, and admin actions.

## 1.7 Innovation

The main innovation in TrustShareAI is the use of a multi-parameter trust engine for a closed community borrowing platform. Most simple systems depend only on average ratings, which can be easily manipulated. TrustShareAI calculates trust using several behavioural signals such as punctuality, completion rate, rating quality, item care, contribution, interaction diversity, verification, responsiveness, and high-value item handling. It also applies anti-gaming logic such as rating concentration penalties, counterparty concentration penalties, overdue penalties, signal mismatch detection, and confidence-based history caps.

Another innovation is the combination of sustainability and trust transparency. Users can see not only their score but also the reason behind it through trust transparency modals, trust history graphs, and trust timeline events. This makes the system explainable and fair for users. The project also uses a premium glassmorphism interface with smooth animations, making the user experience more interactive and visually appealing.

## 1.8 Organization of the Report

This report is organized into the following seven chapters:

Chapter 1 introduces the project, motivation, problem statement, objectives, methodology, innovation, and organization of the report. It explains why a community-based resource sharing system is needed and how TrustShareAI addresses this need.

Chapter 2 presents the literature review related to trust systems, reputation models, sharing economy platforms, authentication, web application frameworks, and database technologies. It also compares selected references and identifies research gaps.

Chapter 3 describes the requirement analysis of the project. It includes functional requirements, non-functional requirements, hardware requirements, software requirements, user roles, and system constraints.

Chapter 4 explains the design of the mini project. It includes high-level architecture, system modules, structure chart, database design, API design, trust engine design, and workflow descriptions.

Chapter 5 presents the implementation details. It discusses programming language selection, platform selection, libraries, tools, folder structure, code conventions, and important implementation features.

Chapter 6 provides experimental results and testing. It includes evaluation metrics, demo dataset, performance analysis, unit testing, integration testing, system testing, and result screenshots to be inserted.

Chapter 7 gives the discussion, conclusion, and future enhancement of the project. It summarizes the outcomes and explains how the system can be improved using AI-based models, mobile apps, and advanced analytics.

\newpage

# Chapter 2

## 2.1 Literature Review

TrustShareAI is based on concepts from reputation systems, sharing economy platforms, secure authentication, full-stack web development, and cloud-based storage. Reputation systems are important because users must make decisions about whether another person is reliable enough to borrow from or lend to. Resnick et al. [1] explain that online reputation systems help people make trust decisions in digital interactions. Josang et al. [2] survey trust and reputation systems and show that ratings after transactions can influence future behaviour and improve service quality.

Sharing economy research also supports the idea that digital platforms can reduce resource duplication and promote collaborative consumption. Hamari et al. [3] discuss why users participate in sharing economy platforms, including sustainability, enjoyment, and economic benefits. Botsman and Rogers [4] describe collaborative consumption as a model where access can be more important than ownership. TrustShareAI applies these ideas to a campus or hostel environment where students can access items temporarily without buying them.

Modern web development technologies also influenced this project. React is used for component-based UI development [5], Vite is used for fast frontend tooling [6], and TailwindCSS is used for utility-first responsive styling [7]. Express.js and Node.js are used to create REST APIs [8], [9]. MongoDB Atlas and Mongoose are used for flexible document-oriented data storage and schema modelling [10], [11]. JWT is used for secure token-based authentication [12], while bcrypt is used for password hashing [13]. Cloudinary is used for image upload and delivery [14], and Nodemailer is used for email notifications [15].

**Fig. 2.1: Trust and Reputation Flow in a Community Sharing Platform**

[Insert figure here: A flow diagram showing User Action -> Borrow Request -> Owner Approval -> Return -> Rating -> Trust Engine -> Updated Trust Score]

**Table 2.1: Summary of selected papers and technologies**

| Authors / Source | Objectives | Strength and Weaknesses | Tool / Concept Used | Limitations |
|---|---|---|---|---|
| Resnick et al. [1] | To explain online reputation systems for trust in digital interactions. | Strength: Establishes the importance of reputation for strangers. Weakness: Focuses mostly on online marketplaces. | Reputation systems | Does not directly address closed physical communities. |
| Josang et al. [2] | To survey trust and reputation systems for online services. | Strength: Provides broad classification of trust models. Weakness: Mostly theoretical comparison. | Trust and reputation models | Does not provide direct implementation for campus sharing. |
| Hamari et al. [3] | To study user participation in sharing economy platforms. | Strength: Explains sustainability and participation motivation. Weakness: Not focused on item-level trust scoring. | Sharing economy | Limited focus on closed communities. |
| Botsman and Rogers [4] | To describe collaborative consumption and access-based economy. | Strength: Strong conceptual base for sharing instead of owning. Weakness: Not a technical system design. | Collaborative consumption | Does not provide software implementation details. |
| React Documentation [5] | To build component-based user interfaces. | Strength: Reusable UI components. Weakness: Requires frontend state management discipline. | React components and hooks | Client-side complexity can increase in large apps. |
| Vite Documentation [6] | To provide fast development and build tooling. | Strength: Fast hot reload and optimized build. Weakness: Requires environment variable configuration. | Vite build tool | Production deployment needs correct build configuration. |
| TailwindCSS Documentation [7] | To build responsive interfaces using utility classes. | Strength: Fast UI development and design consistency. Weakness: Long class strings may reduce readability. | Utility-first CSS | Requires good component organization. |
| Express.js Documentation [8] | To build REST APIs and middleware pipelines. | Strength: Lightweight and flexible backend framework. Weakness: Architecture must be manually organized. | Express routing and middleware | Requires additional libraries for validation and security. |
| Node.js Documentation [9] | To run scalable JavaScript backend services. | Strength: Event-driven and suitable for APIs. Weakness: CPU-heavy tasks may need separate services. | Node.js runtime | Requires careful error handling. |
| MongoDB Atlas Documentation [10] | To provide cloud-hosted document database. | Strength: Flexible schema and cloud scalability. Weakness: Network access must be configured. | MongoDB Atlas | Requires IP access configuration for hosting platforms. |
| Mongoose Documentation [11] | To model MongoDB data using schemas. | Strength: Provides validation and relationships through references. Weakness: Complex queries require careful population. | Mongoose ODM | Schema design must be planned properly. |
| Jones et al. [12] | To define JSON Web Token for claims-based authentication. | Strength: Compact token format for APIs. Weakness: Tokens must be protected and expired properly. | JWT | Token theft can be risky if storage is insecure. |
| Provos and Mazieres [13] | To present adaptable password hashing. | Strength: bcrypt supports salted and cost-based hashing. Weakness: More modern alternatives exist for some use cases. | bcrypt | Hashing cost must be selected carefully. |
| Cloudinary Documentation [14] | To handle image uploads and cloud delivery. | Strength: Simplifies media upload and delivery. Weakness: Requires API configuration and account limits. | Cloudinary Node SDK | External dependency on cloud service. |
| Nodemailer Documentation [15] | To send email notifications using SMTP. | Strength: Flexible SMTP-based email delivery. Weakness: Gmail setup requires app password or provider configuration. | Nodemailer SMTP | Email delivery depends on provider policies. |

## 2.2 Literature Gap

The literature shows that reputation systems and sharing platforms are well established, but many systems either focus on commercial transactions or depend heavily on simple ratings. In a closed community item-sharing platform, a simple rating score is not enough because members can manipulate scores by repeatedly rating friends or by creating only positive interactions with a small group. TrustShareAI addresses this gap by using a multi-parameter trust engine with anti-gaming logic, confidence caps, and transparent score explanations.

## 2.3 Summary

This chapter reviewed trust systems, sharing economy concepts, frontend frameworks, backend technologies, database systems, authentication standards, password hashing, image upload services, and email notification tools. The review supports the need for a secure, explainable, and community-specific resource sharing platform.

\newpage

# Chapter 3

## Preamble

This chapter describes the requirements of TrustShareAI. Requirement analysis is important because it defines what the system should do, how users should interact with it, and what qualities the application should maintain. The system has three major user roles: normal community member, item owner, and community admin. Each role has different permissions and responsibilities.

## 3.1 Functional Requirements

The functional requirements formulated for the project were:

1. User Registration: The system shall allow a new user to register using name, email, password, and community invite code.
2. User Login: The system shall allow registered users to log in using email and password.
3. JWT Authentication: The system shall generate a JWT token after successful login and use it for protected routes.
4. Community Creation: The system shall allow an admin to create a closed community.
5. Invite Code System: The system shall generate an invite code for each community and allow members to join using that code.
6. Item Listing: Users shall be able to add items with title, description, category, image, value tier, and availability status.
7. Item Browsing: Users shall be able to browse all available items in their own community.
8. Search and Filter: Users shall be able to search items by name and filter by category.
9. Item Detail View: Users shall be able to view item image, description, owner profile, trust score, and borrow form.
10. Borrow Request: Users shall be able to send borrow requests with duration and message.
11. Request Approval: Item owners shall be able to approve or reject borrow requests.
12. Active Borrow Tracking: Approved requests shall become active until the item is returned.
13. Return Completion: Owners shall be able to mark items as returned.
14. Ratings and Reviews: Users shall be able to rate completed borrow transactions.
15. Trust Score Calculation: The system shall calculate trust score using multiple behavioural parameters.
16. Credit Points: Users shall earn or lose points based on responsible or irresponsible actions.
17. Badges: Users shall receive badges such as Trusted Neighbor, Top Lender, Community Helper, and Fast Returner.
18. Dashboard: Users shall be able to view trust score, credit points, items lent, items borrowed, and pending requests.
19. Profile Page: Users shall be able to view avatar, community, trust score, ratings, borrow history, and badges.
20. Admin Dashboard: Admins shall be able to view members, trust flags, misuse indicators, and user profiles.
21. Admin User Controls: Admins shall be able to limit borrowing, suspend users, reset trust overrides, and edit user profile information.
22. Image Upload: Users shall be able to upload item images using Cloudinary.
23. Email Notification: Users shall receive email notifications for approved, rejected, and returned borrow actions.
24. Trust Transparency: Users shall be able to understand why a score was calculated using trust transparency modals.
25. Trust History: Users shall be able to view trust history and trust timeline events.

**Fig. 3.1: Functional Requirement Overview of TrustShareAI**

[Insert figure here: A use case diagram showing Member, Owner, and Admin connected to authentication, community, item, borrow, rating, dashboard, and trust modules]

## 3.2 Non Functional Requirements

The non-functional requirements formulated for the project were:

1. Security: Passwords must be hashed using bcrypt and authentication must use JWT.
2. Privacy: Users should see only items and members from their own community.
3. Reliability: Borrow request status should be updated consistently across users.
4. Scalability: The backend should support multiple communities and many users.
5. Maintainability: Code should be modular with separate routes, controllers, models, and reusable frontend components.
6. Usability: The interface should be simple, modern, responsive, and accessible on mobile and desktop devices.
7. Performance: Pages should load quickly using Vite build optimization and efficient API calls.
8. Explainability: Trust score should be transparent and understandable to users.
9. Availability: The application should be deployable using Vercel for frontend and Render for backend.
10. Data Integrity: MongoDB schemas should maintain proper relationships between users, communities, items, borrow requests, ratings, and trust events.
11. Responsiveness: UI components should adapt to different screen sizes.
12. Fault Tolerance: The system should handle API failures and display user-friendly error messages.

## 3.3 Hardware Requirements

The hardware requirements formulated for the project were:

**Table 3.1: Hardware Requirements**

| Component | Minimum Requirement | Recommended Requirement |
|---|---|---|
| Processor | Intel i3 / Apple M1 equivalent | Intel i5 or higher / Apple Silicon |
| RAM | 4 GB | 8 GB or higher |
| Storage | 2 GB free space | 5 GB free space |
| Internet | Required for MongoDB Atlas, Cloudinary, and deployment | Stable broadband connection |
| Display | 1366 x 768 resolution | Full HD or higher |
| Device | Laptop/Desktop | Laptop/Desktop with modern browser |

## 3.4 Software Requirements

The software requirements formulated for this project were:

**Table 3.2: Software Requirements**

| Software | Purpose |
|---|---|
| macOS / Windows / Linux | Development operating system |
| Node.js 20.x | Backend runtime and frontend tooling |
| npm | Package management |
| React | Frontend UI development |
| Vite | Fast frontend development and build tool |
| TailwindCSS | Responsive styling and glassmorphism UI |
| Framer Motion | Animations and transitions |
| Lucide React | Icon library |
| Express.js | Backend REST API framework |
| MongoDB Atlas | Cloud database storage |
| Mongoose | MongoDB schema modelling |
| JWT | Token-based authentication |
| bcrypt | Password hashing |
| Cloudinary | Item image upload and storage |
| Nodemailer | Email notifications |
| VS Code | Code editor |
| Git and GitHub | Version control and repository hosting |
| Render | Backend deployment |
| Vercel | Frontend deployment |
| Postman / Browser DevTools | API and frontend testing |

**Fig. 3.2: Software Requirement Stack of TrustShareAI**

[Insert figure here: React + Vite frontend connected to Express backend, MongoDB Atlas database, Cloudinary media service, Nodemailer SMTP, and optional FastAPI AI engine]

## 3.5 User Roles

The system includes the following user roles:

1. Community Member: Can register, login, browse items, request borrowing, rate users, view dashboard, and manage profile.
2. Item Owner: A member who has listed one or more items. Can approve or reject borrow requests and mark returns.
3. Community Admin: Can manage invite codes, view members, inspect trust profiles, edit member profiles, suspend users, and apply trust or borrow limits.

## 3.6 Summary

This chapter described the functional and non-functional requirements of TrustShareAI along with hardware, software, and user role requirements. The requirements show that the system is not only a basic item listing application but a complete trust-based community sharing platform.

\newpage

# Chapter 4

## Preamble

This chapter explains the design of TrustShareAI. The design phase converts requirements into a structured architecture. The project follows a modular client-server architecture where the React frontend communicates with the Express backend through REST APIs. The backend stores data in MongoDB Atlas and integrates external services such as Cloudinary and Nodemailer. The trust engine is implemented as a backend utility and can later be replaced or extended by an AI microservice.

## 4.1 Design of Mini Project

TrustShareAI is designed as a full-stack web application with separated frontend and backend folders. The frontend is responsible for user interface, routing, forms, cards, animations, and dashboard visualization. The backend is responsible for authentication, business logic, database operations, trust calculation, file upload handling, email notifications, and admin actions. MongoDB Atlas stores persistent data, while Cloudinary stores uploaded images.

The design follows these principles:

1. Modular architecture with separate models, routes, controllers, middleware, and components.
2. REST API communication between frontend and backend.
3. JWT-based protected routes for authenticated access.
4. Community-level access control so users can only interact inside their own community.
5. Transparent trust score calculation using behavioural signals.
6. Responsive and animated user interface for better experience.

## 4.1.1 High Level Design

The high-level design specification aims to illustrate the overall system architecture of TrustShareAI. The system begins with authentication. After login, the user can access community-specific pages such as items, dashboard, profile, requests, and community admin. All frontend API calls are sent to the backend server. The backend validates the JWT token, checks community membership, performs database operations, and returns JSON responses.

**Fig. 4.1: System Architecture of TrustShareAI**

[Insert figure here: Browser/React Client -> REST API/Express Server -> MongoDB Atlas; Express Server -> Cloudinary; Express Server -> Nodemailer SMTP; Express Server -> Trust Engine; optional Express Server -> FastAPI AI Engine]

## 4.1.2 System Architecture Explanation

The system architecture contains the following layers:

1. Presentation Layer: Built using React, Vite, TailwindCSS, Framer Motion, and reusable UI components. It includes pages such as Landing, Login, Register, Items, Item Detail, Dashboard, Profile, Requests, Community Admin, and Admin Dashboard.
2. API Layer: Built using Express.js routes and controllers. It exposes REST APIs for authentication, communities, items, borrow requests, ratings, trust, uploads, dashboard, and admin functions.
3. Business Logic Layer: Contains borrow workflow logic, community validation, trust score computation, credit point updates, email notification triggering, and admin restrictions.
4. Data Access Layer: Uses Mongoose models to interact with MongoDB Atlas collections.
5. External Services Layer: Uses Cloudinary for item images and Nodemailer with SMTP for notifications.
6. AI Extension Layer: Contains a Python FastAPI placeholder service for future AI trust scoring and recommendations.

## 4.2 Detailed Design

The detailed design of the system involved the following considerations:

1. User authentication must be secure and token-based.
2. Every user must belong to one community.
3. Items must be visible only inside the owner's community.
4. Borrow requests must follow a strict status workflow.
5. Trust score must be calculated from multiple behavioural signals.
6. Admins must be able to monitor misuse and control risky accounts.
7. The frontend must be responsive and visually premium.

## 4.2.1 Structure Chart

A structure chart is a top-down hierarchical diagram used in software engineering to visualize a system architecture by breaking it into modules, representing dependencies, and showing data/control passing.

**Fig. 4.2: Structure Chart of TrustShareAI**

[Insert figure here: TrustShareAI -> Frontend, Backend, Database, External Services, AI Engine. Frontend -> Pages and Components. Backend -> Routes, Controllers, Models, Middleware, Utils. Database -> Users, Communities, Items, BorrowRequests, Ratings, TrustEvents, TrustHistory.]

## 4.2.2 Functional Description of the Modules

### 1. Authentication Module

Input: Name, email, password, invite code or community creation details.  
Output: JWT token and authenticated user profile.

The authentication module handles user registration, login, password hashing, token generation, and current user retrieval. Passwords are hashed using bcrypt before being stored. JWT is used to authenticate protected API requests.

### 2. Community Module

Input: Community name, admin ID, invite code.  
Output: Community data, refreshed invite code, member list.

The community module supports closed group creation and invite-based joining. Each community has an invite code and a list of members. Admins can refresh invite codes and view community members.

### 3. Item Marketplace Module

Input: Item title, description, category, image URL, value tier, owner ID, community ID.  
Output: List of items, item detail, availability status.

This module allows users to list items and browse available items in their community. It supports item cards, item detail pages, image upload, category filters, and search functionality.

### 4. Borrow Request Module

Input: Item ID, borrower ID, owner ID, requested duration, message.  
Output: Borrow request status and updated item availability.

This module handles the borrow workflow. A user sends a request to borrow an item. The owner can approve or reject the request. Approved requests become active. After the item is returned, the owner marks it as returned and the item becomes available again.

### 5. Rating and Review Module

Input: Borrow request ID, rating score, care score, comment.  
Output: Rating record and updated trust score.

After a completed borrow transaction, users can rate each other. Ratings are used by the trust engine along with other behavioural signals.

### 6. Trust Engine Module

Input: User transactions, ratings, item values, response time, verification details, trust events.  
Output: Trust score, trust tier, borrow limits, explanation breakdown.

The trust engine calculates trust using multiple weighted signals. The formula version used is `v2-multiparameter-anti-gaming`. Signals include punctuality, completion, rating, care, contribution, diversity, verification, responsiveness, and value handling. Penalties are applied for overdue exposure, late return pattern, rating concentration, counterparty concentration, signal mismatch, and suspension.

### 7. Credit Point and Badge Module

Input: Responsible or irresponsible user actions.  
Output: Updated credit points and badges.

Users earn points for lending items and returning on time. Users may lose points for late returns. Badges are assigned based on user behaviour such as high lending activity, fast returns, and community contribution.

### 8. Dashboard Module

Input: Authenticated user ID and community ID.  
Output: Dashboard analytics.

The dashboard displays trust score, credit points, items lent, items borrowed, pending requests, trust history chart, and trust timeline. It helps users understand their activity and reputation.

### 9. Admin Module

Input: Admin token and member actions.  
Output: Admin overview, member profile, trust controls.

The admin module allows administrators to view community members, inspect trust breakdowns, edit user profile information, apply borrow limits, suspend users, clear overrides, and monitor trust misuse.

### 10. Upload and Notification Module

Input: Image file or notification event.  
Output: Cloudinary image URL or email notification.

Cloudinary is used to upload item images and return secure image URLs. Nodemailer is used to send email notifications when borrow requests are approved, rejected, or returned.

### 11. AI Engine Placeholder Module

Input: Trust-related user data.  
Output: AI-generated trust score or recommendation in future scope.

The `ai-engine` folder contains a FastAPI structure with `api.py`, `trust_model.py`, and `recommender.py`. At present, the production trust score is rule-based, but the architecture allows future replacement with a trained model.

## 4.3 Database Design

The database is stored in MongoDB Atlas. Mongoose is used to define schemas and relationships.

**Table 4.1: User Collection**

| Field | Description |
|---|---|
| name | Name of the user |
| email | Unique email address |
| password | bcrypt hashed password |
| communityId | Reference to community |
| trustScore | Calculated trust score from 0 to 100 |
| trustTier | LOW, MODERATE, RELIABLE, or HIGHLY_RELIABLE |
| creditPoints | Goodness points earned by user |
| avatar | User profile image URL |
| verification | Email, community, and ID verification details |
| accountStatus | ACTIVE, LIMITED, or SUSPENDED |
| manualBorrowLimits | Admin-defined borrowing restrictions |
| manualTrustOverride | Optional admin trust override |
| createdAt | Account creation date |

**Table 4.2: Community Collection**

| Field | Description |
|---|---|
| name | Name of community |
| adminId | User ID of community admin |
| inviteCode | Code used to join community |
| members | Array of user IDs |
| createdAt | Creation date |

**Table 4.3: Item Collection**

| Field | Description |
|---|---|
| title | Item name |
| description | Item description |
| category | Item category |
| ownerId | User who owns the item |
| communityId | Community where item belongs |
| imageUrl | Cloudinary image URL |
| available | Availability status |
| valueTier | LOW, MEDIUM, or HIGH |
| createdAt | Item creation date |

**Table 4.4: BorrowRequest Collection**

| Field | Description |
|---|---|
| itemId | Borrowed item ID |
| borrowerId | User requesting the item |
| ownerId | Owner of the item |
| status | PENDING, APPROVED, ACTIVE, REJECTED, or RETURNED |
| durationDays | Requested duration |
| message | Message to owner |
| requestedAt | Request date |
| approvedAt | Approval date |
| rejectedAt | Rejection date |
| dueAt | Expected return date |
| returnedAt | Actual return date |

**Table 4.5: Rating Collection**

| Field | Description |
|---|---|
| fromUserId | User giving rating |
| toUserId | User receiving rating |
| borrowRequestId | Related borrow request |
| score | Rating score |
| careScore | Item care rating |
| comment | Review comment |
| createdAt | Rating date |

**Table 4.6: TrustEvent and TrustHistory Collections**

| Collection | Purpose |
|---|---|
| TrustEvent | Stores timeline events such as first borrow, late return, rating received, admin action, and return events |
| TrustHistory | Stores periodic trust score snapshots and breakdowns for graph visualization |

## 4.4 Trust Score Design

The trust score is calculated from 0 to 100. The engine combines weighted behavioural signals with confidence and anti-gaming penalties.

**Table 4.7: Trust Engine Signals and Weights**

| Signal | Weight | Meaning |
|---|---:|---|
| Punctuality | 0.18 | Measures whether borrowed items are returned on time |
| Completion | 0.14 | Measures completed borrow/lend transactions |
| Rating | 0.16 | Measures average received rating quality |
| Care | 0.12 | Measures how well items are returned |
| Contribution | 0.08 | Measures listed items and lending contribution |
| Diversity | 0.12 | Measures interaction with multiple community members |
| Verification | 0.08 | Measures account and community verification |
| Responsiveness | 0.06 | Measures owner response time to requests |
| Value Handling | 0.06 | Measures handling of medium/high value items |

The base composite score is calculated as:

`Base Composite = Sum of (Signal Value x Signal Weight)`

The trust engine also calculates confidence from transaction history, rating history, and diversity history. A prior score is blended when the user has limited history. A history cap prevents new users from immediately reaching very high trust with only a few interactions.

Penalties are applied for:

1. Active overdue borrows.
2. Late return patterns.
3. Rating concentration from the same user.
4. Counterparty concentration with the same member.
5. Mismatch between high ratings and weak completion/punctuality.
6. Admin suspension.

The final trust score is:

`Final Trust Score = round(Final Normalized Trust x 100)`

Trust tiers are:

**Table 4.8: Trust Tiers and Borrow Limits**

| Trust Tier | Score Range | Max Active Borrows | Max Value Tier | Max Duration |
|---|---:|---:|---|---:|
| LOW | 0-39 | 1 | LOW | 7 days |
| MODERATE | 40-59 | 2 | MEDIUM | 14 days |
| RELIABLE | 60-79 | 3 | HIGH | 21 days |
| HIGHLY_RELIABLE | 80-100 | 4 | HIGH | 30 days |

## 4.5 API Design

**Table 4.9: Major API Endpoints**

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/register` | POST | Register user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/me` | GET | Get current user |
| `/api/communities/me` | GET | Get current community |
| `/api/items` | GET/POST | List or create items |
| `/api/items/:id` | GET/PATCH | View or update item |
| `/api/borrows` | GET/POST | View or create borrow requests |
| `/api/borrows/:id/approve` | PATCH | Approve request |
| `/api/borrows/:id/reject` | PATCH | Reject request |
| `/api/borrows/:id/return` | PATCH | Mark returned |
| `/api/ratings` | POST | Submit rating |
| `/api/dashboard` | GET | Get dashboard analytics |
| `/api/trust/history` | GET | Get trust history |
| `/api/trust/timeline` | GET | Get trust timeline |
| `/api/upload/item-image` | POST | Upload item image |
| `/api/admin/overview` | GET | Admin overview |
| `/api/admin/users/:id` | GET | View member profile |
| `/api/admin/users/:id/profile` | PATCH | Edit member profile |

## 4.6 Summary

This chapter described the design of TrustShareAI, including architecture, modules, database design, trust engine design, and API design. The design ensures that the system is modular, secure, explainable, and scalable.

\newpage

# Chapter 5

## 5.1 Implementation

TrustShareAI was implemented as a modular full-stack web application. The project is divided into three main folders: `client`, `server`, and `ai-engine`. The `client` folder contains the React frontend. The `server` folder contains the Express backend. The `ai-engine` folder contains the future FastAPI microservice structure for AI-based trust scoring and recommendations.

The frontend implements the visual interface using reusable components such as GlassCard, AnimatedButton, TrustMeter, ItemCard, Navbar, BorrowRequestModal, TrustTransparencyModal, TrustHistoryChart, TrustTimeline, and AdminMemberProfileModal. The backend implements REST API routes, controllers, Mongoose models, middleware, and utility functions. The database is hosted on MongoDB Atlas.

## 5.2 Programming Language Selection

The programming languages selected for the project were JavaScript and Python.

JavaScript was selected because it can be used for both frontend and backend development. React uses JavaScript for building interactive UI components, while Node.js uses JavaScript for backend API development. This makes the project easier to maintain because the same language is used across most of the application.

Python was selected for the optional AI engine because Python has strong support for machine learning, data processing, and AI services. The `ai-engine` folder contains a FastAPI-based structure that can later be connected to the backend for AI trust scoring or recommendation models.

**Table 5.1: Programming Language Selection**

| Language | Used In | Reason for Selection |
|---|---|---|
| JavaScript | React frontend and Express backend | Full-stack development with same language |
| Python | Future AI engine | Strong support for AI/ML and FastAPI microservices |
| HTML/CSS | Frontend rendering and styling | Required for web interface and responsive design |

## 5.3 Platform Selection

The platform selected for development and deployment includes:

1. Frontend Platform: React + Vite application deployed using Vercel.
2. Backend Platform: Node.js + Express.js application deployed using Render.
3. Database Platform: MongoDB Atlas cloud database.
4. Media Platform: Cloudinary for item image upload and storage.
5. Email Platform: Gmail SMTP through Nodemailer for notifications.
6. Version Control Platform: GitHub.

The selected platforms are suitable for a mini project because they provide free or low-cost hosting, simple setup, and good integration with JavaScript-based applications.

## 5.4 Libraries Used

**Table 5.2: Libraries Used in TrustShareAI**

| Library | Purpose |
|---|---|
| React | Component-based UI development |
| React Router DOM | Frontend routing and protected pages |
| TailwindCSS | Responsive and glassmorphism styling |
| Framer Motion | Page transitions, card animations, hover effects, and trust score animations |
| Lucide React | Icon components |
| Express.js | Backend API framework |
| Mongoose | MongoDB schema modelling and queries |
| bcrypt | Password hashing |
| jsonwebtoken | JWT token generation and verification |
| cors | Cross-origin request handling |
| dotenv | Environment variable configuration |
| multer | File upload parsing |
| cloudinary | Cloud image upload and delivery |
| nodemailer | SMTP email notifications |
| morgan | HTTP request logging |
| nodemon | Backend development auto-restart |

## 5.5 Tools Used

**Table 5.3: Tools Used in TrustShareAI**

| Tool | Purpose |
|---|---|
| VS Code | Code editing and project management |
| Git | Version control |
| GitHub | Remote repository hosting |
| MongoDB Atlas | Cloud database management |
| Cloudinary Console | Image storage management |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Browser DevTools | UI debugging and network request inspection |
| npm | Package installation and script execution |
| Postman / Thunder Client | API testing |

## 5.6 Code Conventions

The following code conventions were followed:

1. Backend code is separated into routes, controllers, models, middleware, config, and utils.
2. Frontend code is separated into pages, components, context, and library files.
3. Component names use PascalCase, such as `GlassCard` and `TrustMeter`.
4. API functions are centralized in the frontend API helper.
5. Environment variables are stored in `.env` files and not hardcoded in source logic.
6. Passwords are hashed before storage.
7. JWT middleware protects private routes.
8. Admin middleware protects admin-only routes.
9. Database relationships are maintained using Mongoose ObjectId references.
10. Reusable UI components are used to reduce duplication.
11. Error handling is centralized using async handler and error middleware.
12. Trust scoring logic is kept in a separate utility file for maintainability.

## 5.7 Folder Structure

**Table 5.4: Folder Structure**

| Folder / File | Purpose |
|---|---|
| `client/src/components` | Reusable frontend components |
| `client/src/pages` | Main application pages |
| `client/src/context` | Authentication context |
| `client/src/lib` | API helper functions |
| `server/controllers` | Backend request handlers |
| `server/routes` | REST route definitions |
| `server/models` | Mongoose schemas |
| `server/middleware` | Authentication, admin, and error middleware |
| `server/config` | Database and Cloudinary configuration |
| `server/utils` | Trust engine, email, invite code, and helper logic |
| `server/scripts` | Demo data seeding scripts |
| `ai-engine` | Future Python AI microservice |

## 5.8 Important Implementation Features

### 5.8.1 Authentication

The authentication system supports registration, login, and current user retrieval. Passwords are hashed using bcrypt. JWT tokens are generated during login and stored on the client side for authenticated API requests.

### 5.8.2 Community Invite System

An admin can create a community, and the system generates an invite code. Users can join the community by entering the invite code during registration. Each user belongs to one community.

### 5.8.3 Item Listing and Browsing

Users can list items with title, category, description, image, availability, and value tier. Other users in the same community can browse items and request borrowing.

### 5.8.4 Borrow Request Flow

When a user clicks the borrow button, a modal opens and asks for duration and message. The request is sent to the owner. The owner can approve or reject it. Approved requests become active, and after return the request becomes returned.

### 5.8.5 Trust Transparency

The dashboard shows the trust score and allows the user to view why the score was calculated. The trust explanation includes signals, weights, penalties, confidence, strengths, and risk flags.

### 5.8.6 Admin Controls

The admin dashboard provides community-level monitoring. Admins can view and edit member profiles, inspect trust details, apply borrow limits, suspend users, and clear trust overrides.

### 5.8.7 UI and Animation

The frontend uses frosted glass cards, pastel gradient backgrounds, smooth Framer Motion animations, hover transitions, floating cards, and responsive layouts. This gives the platform a premium and modern user experience.

## 5.9 Summary

This chapter explained the implementation of TrustShareAI, including programming language selection, platform selection, libraries, tools, code conventions, folder structure, and important implemented features. The implementation follows a modular and maintainable approach.

\newpage

# Chapter 6

## 6.1 Experimental Results and Testing

This chapter presents the testing and experimental results of TrustShareAI. The system was tested using demo users, demo items, and simulated borrow histories. The demo dataset includes normal users, reliable users, users with late return behaviour, users with multiple ratings, and users with different item lending patterns. Testing was performed manually through the browser and by using backend API requests.

The purpose of testing was to verify that authentication, community joining, item listing, borrow request workflow, trust score calculation, ratings, dashboard analytics, admin controls, image upload, and email notification features work correctly.

## 6.2 Evaluation Metrics

The evaluation metrics used for the project were:

1. Authentication Success Rate: Measures whether valid users can login and invalid users are rejected.
2. API Response Correctness: Measures whether APIs return expected data and status codes.
3. Borrow Workflow Accuracy: Measures whether request status changes correctly from pending to active/rejected/returned.
4. Trust Score Explainability: Measures whether the system provides clear signal and penalty breakdowns.
5. Trust Manipulation Resistance: Measures whether repeated ratings from the same user are penalized.
6. UI Responsiveness: Measures whether pages work properly on desktop and mobile screens.
7. Image Upload Success: Measures whether item images upload successfully to Cloudinary.
8. Email Notification Success: Measures whether notification events are triggered.
9. Admin Control Accuracy: Measures whether admin actions update user restrictions correctly.
10. Build Success: Measures whether frontend production build completes without errors.

## 6.3 Experimental Dataset

A demo dataset was created for testing the system. The dataset contains realistic community members, item listings, borrow requests, returned requests, late returns, ratings, and trust history records.

**Table 6.1: Experimental Dataset Description**

| Dataset Entity | Approximate Data Used | Purpose |
|---|---:|---|
| Users | 12 users | Test authentication, community membership, trust variation |
| Communities | 1 community | Test closed community access |
| Items | 17 items | Test item listing, categories, and availability |
| Borrow Requests | 22 requests | Test pending, active, rejected, returned, and late behaviours |
| Ratings | Multiple ratings | Test rating and care score effect |
| Trust Events | Multiple events | Test trust timeline |
| Trust History | Multiple snapshots | Test trust graph |

## 6.4 Performance Analysis

**Table 6.2: Performance Parameters for Trust Engine and Web Application**

| Module | Evaluation Parameter | Expected Result | Observed Result |
|---|---|---|---|
| Authentication | Valid login | User receives JWT token | Successful during local testing |
| Authentication | Invalid login | User receives invalid credentials message | Successful during local testing |
| Community | Invite code validation | Only correct invite code allows joining | Successful during local testing |
| Item Marketplace | Item listing and browsing | Items shown only inside same community | Successful during local testing |
| Borrow Flow | Request creation | Borrow request created as pending | Successful during local testing |
| Borrow Flow | Approval and return | Status changes correctly | Successful during local testing |
| Trust Engine | Multi-signal score | Score changes based on user behaviour | Successful during demo dataset testing |
| Trust Engine | Anti-gaming | Concentrated ratings and limited history reduce score confidence | Implemented and tested with demo data |
| Dashboard | Analytics display | Trust, points, items, requests visible | Successful during local testing |
| Admin | Member monitoring | Admin can view and edit member profiles | Successful during local testing |
| Frontend Build | Production build | Build completes without error | Successful |

The frontend production build was tested using `npm run build`. The build completed successfully, showing that the React application can be prepared for production deployment.

## 6.5 Result Screenshots

The following screenshots should be added in the final report:

[Insert screenshot here: Landing Page with hero section and glass cards]

**Fig. 6.1: Landing Page of TrustShareAI**

[Insert screenshot here: Login or Register Page]

**Fig. 6.2: Authentication Page of TrustShareAI**

[Insert screenshot here: Item Marketplace Page]

**Fig. 6.3: Item Marketplace with Search and Category Filters**

[Insert screenshot here: Borrow Request Modal]

**Fig. 6.4: Borrow Request Modal after Clicking Borrow Button**

[Insert screenshot here: Dashboard Page]

**Fig. 6.5: User Dashboard Showing Trust Score and Analytics**

[Insert screenshot here: Trust Transparency Modal]

**Fig. 6.6: Trust Transparency Modal Showing Score Breakdown**

[Insert screenshot here: Admin Dashboard]

**Fig. 6.7: Admin Dashboard for Trust and Member Monitoring**

## 6.6 Unit Testing

Unit testing comprises testing individual units or modules that make up the system. Unit testing helps identify bugs at an early stage and reduces the chance of errors affecting the complete system.

**Table 6.3: Unit Testing Modules, Input, Expected Output, and Received Output**

| No. | Module Tested | Input | Expected Output | Output | Testing Environment |
|---:|---|---|---|---|---|
| 1 | Register API | Name, email, password, invite code | New user created and token returned | New user created and token returned | Manual API testing |
| 2 | Login API | Valid email and password | JWT token and user data | JWT token and user data | Manual API testing |
| 3 | Login API | Wrong password | Invalid credentials message | Invalid credentials message | Manual API testing |
| 4 | Item Create API | Item details | Item stored in database | Item stored in database | Manual API testing |
| 5 | Item List API | Authenticated request | Community items returned | Community items returned | Browser testing |
| 6 | Borrow Request API | Item ID, duration, message | Pending request created | Pending request created | Manual API testing |
| 7 | Trust Engine | User ID with history | Trust profile generated | Trust profile generated | Local backend testing |
| 8 | Upload API | Image file | Cloudinary image URL | Cloudinary image URL | Manual testing |
| 9 | Admin Profile API | Member ID | Member profile details | Member profile details | Manual API testing |
| 10 | Dashboard API | User token | Analytics returned | Analytics returned | Browser testing |

## 6.7 Integration Testing

Integration testing is performed to inspect how individual modules work together. It verifies whether any loss of information occurs between modules and whether the input and output formats are compatible.

**Table 6.4: Integration Testing Modules, Input, Expected Output, and Received Output**

| No. | Module Tested | Input | Expected Output | Output | Testing Environment |
|---:|---|---|---|---|---|
| 1 | Frontend Login with Backend Auth | Login form data | Token stored and dashboard opened | Token stored and dashboard opened | Browser testing |
| 2 | Item Card with Borrow Modal | Borrow button click | Modal opens with item details | Modal opens with item details | Browser testing |
| 3 | Borrow Modal with Backend Borrow API | Duration and message | Borrow request created | Borrow request created | Browser testing |
| 4 | Owner Requests with Borrow Controller | Approve request | Status updated and item unavailable | Status updated and item unavailable | Browser testing |
| 5 | Return Flow with Trust Engine | Mark returned | Request returned and trust recomputed | Request returned and trust recomputed | Manual testing |
| 6 | Rating with Trust History | Rating submission | Rating saved and score updated | Rating saved and score updated | Manual testing |
| 7 | Upload UI with Cloudinary API | Image file | Image URL appears in item detail | Image URL appears in item detail | Manual testing |
| 8 | Admin Dashboard with Admin API | Admin token | Member data and trust flags visible | Member data and trust flags visible | Browser testing |
| 9 | Email Notification with Borrow Flow | Approval/return event | Notification email triggered | Notification email triggered when SMTP configured | Manual testing |

## 6.8 System Testing

System testing evaluates the complete integrated application. It checks whether the platform works smoothly from registration to borrowing, returning, rating, trust score update, and admin monitoring.

**Table 6.5: System Testing Modules, Input, Expected Output, and Received Output**

| SL. No. | Module Tested | Input | Expected Output | Output | Testing Environment |
|---:|---|---|---|---|---|
| 1 | Complete User Flow | Register, login, browse, borrow | User completes borrowing process | Flow completed successfully | Browser testing |
| 2 | Complete Owner Flow | List item, approve request, mark returned | Owner completes lending process | Flow completed successfully | Browser testing |
| 3 | Complete Trust Flow | Return and rating events | Trust score and timeline update | Trust score and timeline update | Browser testing |
| 4 | Complete Admin Flow | View user, apply limit, inspect trust | Admin controls work correctly | Admin controls work correctly | Browser testing |
| 5 | Black Box Testing | Normal application usage | System works smoothly | System works smoothly locally | Browser testing |
| 6 | Responsive Testing | Mobile and desktop screen sizes | UI adapts properly | UI adapts properly | Browser DevTools |
| 7 | Deployment Readiness | Production build | Build completes successfully | Build completed successfully | Local terminal |

## 6.9 Summary

The testing results show that TrustShareAI supports the core features required for a community resource sharing platform. Authentication, item listing, borrow requests, ratings, trust scoring, dashboard analytics, admin controls, image upload, and frontend build were tested successfully in the local development environment. The system is prepared for cloud deployment after configuring production environment variables and database network access.

\newpage

# Chapter 7

## 7.1 Discussion

TrustShareAI demonstrates how a closed community can use a digital platform to share physical resources safely and efficiently. The project solves the problem of unorganized borrowing by providing structured item listing, request approval, return tracking, ratings, and trust scoring. The trust engine is a major part of the project because it does not depend only on ratings. It also considers punctuality, completion, care, contribution, diversity, verification, responsiveness, and value handling. This makes the trust score more reliable and less vulnerable to manipulation.

The project also shows how sustainability can be supported through technology. By encouraging users to borrow instead of buying, TrustShareAI can reduce duplicate purchases and promote responsible resource usage. The dashboard, badges, and credit point system motivate users to behave responsibly. The admin dashboard gives community administrators tools to monitor misuse and maintain safety.

## 7.2 Conclusion

TrustShareAI is a modern full-stack web application for intelligent community resource sharing. The system allows users in closed communities to share physical items without monetary transactions. It provides secure authentication, community invite codes, item marketplace, item detail pages, borrow request workflow, rating system, multi-parameter trust score, credit points, badges, dashboard analytics, profile pages, admin monitoring, image uploads, and email notifications.

The project successfully combines frontend design, backend API development, cloud database integration, media upload, email notification, and trust-based decision support. The implemented trust engine improves reliability by using multiple parameters and anti-gaming penalties. The user interface uses glassmorphism design, pastel gradients, and animations to provide a premium experience. Overall, the project satisfies the goal of building a trust-focused, sustainability-oriented, and community-driven resource sharing platform.

## 7.3 Future Enhancement

The following enhancements can be implemented in future versions:

1. AI Trust Model: Train a machine learning model using borrow history, ratings, late returns, and user behaviour to predict trust more accurately.
2. Recommendation System: Recommend items to users based on previous borrowing behaviour, category interest, and community trends.
3. Mobile Application: Develop Android and iOS apps for easier access.
4. Real-Time Notifications: Use WebSockets for instant request and approval updates.
5. Chat System: Allow borrower and owner to communicate inside the platform.
6. QR Code Returns: Generate QR codes to confirm item handover and return.
7. Calendar Availability: Allow owners to mark available dates for each item.
8. Advanced Admin Analytics: Add misuse heatmaps, trust distribution charts, and community health metrics.
9. Identity Verification: Add student ID or apartment ID verification.
10. Fine System Integration: Add optional non-monetary penalties or temporary restrictions for repeated misuse.
11. Sustainability Metrics: Show estimated money saved, items reused, and waste reduced.
12. AI Fraud Detection: Detect suspicious rating patterns and fake borrowing loops.
13. Multi-Community Support: Allow users to switch between multiple approved communities.
14. Progressive Web App: Add offline support and installable app behaviour.
15. Advanced Image Moderation: Detect inappropriate or irrelevant uploaded item images.

\newpage

# References

[1] P. Resnick, K. Kuwabara, R. Zeckhauser, and E. Friedman, "Reputation systems," Communications of the ACM, vol. 43, no. 12, pp. 45-48, 2000, doi: 10.1145/355112.355122.

[2] A. Josang, R. Ismail, and C. Boyd, "A survey of trust and reputation systems for online service provision," Decision Support Systems, vol. 43, no. 2, pp. 618-644, 2007, doi: 10.1016/j.dss.2005.05.019.

[3] J. Hamari, M. Sjoklint, and A. Ukkonen, "The sharing economy: Why people participate in collaborative consumption," Journal of the Association for Information Science and Technology, vol. 67, no. 9, pp. 2047-2059, 2016, doi: 10.1002/asi.23552.

[4] R. Botsman and R. Rogers, What's Mine Is Yours: The Rise of Collaborative Consumption. New York, NY, USA: HarperBusiness, 2010.

[5] React Team, "React documentation," React, 2026. [Online]. Available: https://react.dev/. [Accessed: Apr. 22, 2026].

[6] Vite Team, "Vite documentation," Vite, 2026. [Online]. Available: https://vite.dev/. [Accessed: Apr. 22, 2026].

[7] Tailwind Labs, "Tailwind CSS documentation," Tailwind CSS, 2026. [Online]. Available: https://tailwindcss.com/docs. [Accessed: Apr. 22, 2026].

[8] Express.js Team, "Express.js documentation," Express, 2026. [Online]. Available: https://expressjs.com/. [Accessed: Apr. 22, 2026].

[9] OpenJS Foundation, "Node.js documentation," Node.js, 2026. [Online]. Available: https://nodejs.org/en/docs/. [Accessed: Apr. 22, 2026].

[10] MongoDB, Inc., "MongoDB Atlas documentation," MongoDB Docs, 2026. [Online]. Available: https://www.mongodb.com/docs/atlas/. [Accessed: Apr. 22, 2026].

[11] Mongoose, "Mongoose documentation," Mongoose ODM, 2026. [Online]. Available: https://mongoosejs.com/docs/. [Accessed: Apr. 22, 2026].

[12] M. Jones, J. Bradley, and N. Sakimura, "JSON Web Token (JWT)," RFC 7519, Internet Engineering Task Force, May 2015. [Online]. Available: https://datatracker.ietf.org/doc/rfc7519/. [Accessed: Apr. 22, 2026].

[13] N. Provos and D. Mazieres, "A future-adaptable password scheme," in Proc. 1999 USENIX Annual Technical Conference, Monterey, CA, USA, 1999, pp. 81-92.

[14] Cloudinary, "Node.js image and video upload documentation," Cloudinary Docs, 2026. [Online]. Available: https://cloudinary.com/documentation/node_image_and_video_upload. [Accessed: Apr. 22, 2026].

[15] Nodemailer, "SMTP transport documentation," Nodemailer Docs, 2026. [Online]. Available: https://nodemailer.com/smtp. [Accessed: Apr. 22, 2026].

[16] Motion, "Motion for React documentation," Motion, 2026. [Online]. Available: https://motion.dev/docs/react. [Accessed: Apr. 22, 2026].

\newpage

# Appendix

## Publication Details (if any)

At the current stage of the mini project, no research paper or external publication has been published based on TrustShareAI. The project is developed as an academic mini project. If the project is extended in the future, possible publication topics include multi-parameter trust scoring for closed community sharing systems, anti-gaming reputation models, and sustainability-focused peer-to-peer resource sharing in campus communities.

## Appendix A: Deployment Notes

The project is prepared for deployment using Vercel for the frontend and Render for the backend. MongoDB Atlas is used as the production database. For successful deployment, the following environment variables must be configured on the backend hosting platform: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `NODE_ENV`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM`. The frontend requires `VITE_API_URL` pointing to the deployed backend API URL.

## Appendix B: Suggested Screenshots to Add

1. Landing Page with hero section.
2. Register Page with community invite code.
3. Login Page.
4. Item Marketplace Page.
5. Item Detail Page.
6. Borrow Request Modal.
7. Borrow Requests Page.
8. Dashboard Page.
9. Trust Transparency Modal.
10. Trust History Chart.
11. Profile Page with badges.
12. Community Admin Page.
13. Admin Dashboard Page.
14. Cloudinary Image Upload Result.
15. MongoDB Atlas Collections View.

