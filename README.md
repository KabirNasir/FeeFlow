# FeeFlow

Made By Riya and Kabir Nasir 

# FeeFlow Documentation

This document provides two types of documentation for the FeeFlow codebase: a deep technical overview for developers and a simplified guide for non-technical users.

***

## 1. Deep Technical Documentation (for Developers)

### Overall Purpose

**FeeFlow** is a full-stack web application designed for tuition fee management. It enables teachers or administrators to manage classes, enroll students, track fee payments, and generate financial reports. The application is built with a **React** frontend and a **Node.js/Express** backend, utilizing a **MongoDB** database for data storage.

### Frontend (Client-Side)

* #### Framework and UI
    * Built with **React**, employing functional components and hooks (`useState`, `useEffect`, `useContext`) for state and lifecycle management.
    * The user interface is constructed with **Material-UI (MUI)**, which provides a comprehensive suite of UI components like buttons, forms, tables, and dialogs.

* #### Routing and State Management
    * Client-side routing is handled by **React Router (`react-router-dom`)**, which includes a `ProtectedRoute` component to secure routes for authenticated users.
    * Global state management, particularly for authentication, is managed via **React Context** through an `AuthContext` provider.

* #### API Communication and Authentication
    * **Axios** is utilized for all HTTP requests to the backend API. A centralized API service is configured to set the base URL and automatically attach the JWT token to request headers.
    * The application implements token-based authentication. A JWT is stored in `localStorage` upon successful login and is included in the `Authorization` header of subsequent API calls.
    * **Google OAuth** is also integrated for user sign-in and registration.

### Backend (Server-Side)

* #### Framework and Database
    * The backend is a **Node.js** application built with the **Express** framework.
    * It uses **MongoDB** as its database, with **Mongoose** serving as the Object Data Modeling (ODM) library to define schemas and interact with the database. The database connection logic is encapsulated in `backend/utils/db.js`.

* #### API Architecture
    * The API adheres to a RESTful architecture, organized into **routes**, **controllers**, and **models**:
        * **Routes**: Define the API endpoints (e.g., `/api/auth`, `/api/classes`).
        * **Controllers**: Contain the business logic for handling requests and generating responses (e.g., `authController.js`, `classController.js`).
        * **Models**: Define the Mongoose schemas for database collections (e.g., `User.js`, `Class.js`, `Student.js`).

* #### Authentication and Security
    * **JWT (JSON Web Tokens)** are used for stateless authentication. The `jsonwebtoken` library handles token signing and verification. A `protect` middleware is implemented to secure routes by verifying the token on incoming requests.
    * User passwords are securely hashed using **bcryptjs** before being stored in the database.

* #### Automated Tasks and Notifications
    * **node-cron** is used to schedule recurring background jobs, such as generating monthly fee records and sending automated payment reminders.
    * Email notifications are sent using **Nodemailer**, facilitating features like password resets and fee reminders.

### Data Flow and Key Features

1.  **User Management**: Users can register, log in (via email/password or Google), and manage their profiles.
2.  **Class Management**: Authenticated users (teachers) can perform full CRUD (Create, Read, Update, Delete) operations on classes. Each class includes details such as subject, grade, schedule, and fee information.
3.  **Student and Enrollment Management**: Teachers can manage a roster of students, including personal and parent contact details. Students can be enrolled in or unenrolled from classes.
4.  **Fee Processing**: The system automatically generates monthly fee records for all actively enrolled students. Teachers can also trigger this process manually. Payments can be recorded against these fee records, and their status is tracked (e.g., paid, unpaid, overdue).
5.  **Reporting**: The application provides functionality to generate and view summary reports for fee collections.

### Dependencies and Setup

* The key dependencies for both the frontend and backend are listed in their respective `package.json` files.
* The application can be set up and run using the provided `run.sh` script, which installs all necessary dependencies and concurrently starts both the frontend and backend servers.

***

## 2. Simple, Plain-Language Documentation (for Non-Technical Users)

### What is FeeFlow?

**FeeFlow** is a simple and easy-to-use application that helps teachers and tutors manage their classes and student fee payments. With FeeFlow, you can:

* Keep track of all your classes and students in one place.
* Enroll students into classes.
* Automatically generate monthly fee records for each student.
* Record payments and track who has paid and who hasn't.
* Get a summary of your fee collections.

### How to Use or Run This Code

To get FeeFlow running on your computer, you'll need to follow a few simple setup steps.

#### Prerequisites

Before you start, make sure you have the following installed on your computer:

* **Node.js**: This is a program that lets you run the application.
* **npm**: This is a tool that comes with Node.js and helps you install the code's dependencies (the other tools it needs to work).
* **MongoDB**: This is the database where all your information (like student and class details) will be stored.

#### Running the Application

1.  **Download the Code**: First, you'll need to have the FeeFlow code on your computer.

2.  **Open a Terminal**: Open a terminal or command prompt window. This is a program that lets you type commands to your computer.

3.  **Navigate to the Code Folder**: Use the `cd` command to move into the folder where you saved the FeeFlow code. For example:
    ```
    cd path/to/your/feeflow/folder
    ```

4.  **Run the Script**: Once you're in the right folder, simply run the following command:
    ```
    ./run.sh
    ```
    This script will automatically:
    * Install all the necessary tools and libraries for both the backend (the "engine") and the frontend (the "website").
    * Start the backend server.
    * Start the frontend application.

5.  **Access FeeFlow**: Once the script has finished, you can open your web browser and go to **http://localhost:3000** to use the FeeFlow application.

That's it! You should now have FeeFlow up and running.
