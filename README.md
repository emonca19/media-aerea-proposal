# Pilot Operations Platform for MediaAérea

<div align="center">
  <img src="https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Expo%20Router-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo Router">
  <img src="https://img.shields.io/badge/Winner-FFD700?style=for-the-badge&logo=trophy&logoColor=black" alt="Winner">
</div>

This repository contains the **award-winning** mobile operations platform designed for **[MediaAérea Drone Solutions](https://www.mediaaerea.com.mx/)**. It is a comprehensive, cross-platform frontend and architectural blueprint created to solve real-world challenges in the aerospace industry.

This project won **First Place** at the **["Jóvenes Impulsando la Industria"](https://economiayturismo.sonora.gob.mx/component/content/article/jovenes-impulsando-la-industria-cajeme?catid=13&Itemid=101)** regional innovation competition.

## Key Features

The application provides distinct, role-based interfaces for pilots and administrators to streamline daily operations, from task assignment to incident reporting.

### Pilot Features
-   **Dashboard**: Real-time overview of assigned tasks and daily progress.
-   **Flight Calendar**: Manage and view scheduled flight operations.
-   **Activity Logging**: Log detailed time entries for flights, travel, and downtime.
-   **Incident Reporting**: Document field issues with mandatory photographic evidence.

### Admin Features
-   **Centralized Dashboard**: Comprehensive oversight of all team operations.
-   **Resource Management**: Manage clients, projects, wind parks, and user accounts.
-   **Task Assignment**: Allocate projects and tasks to field teams.
-   **Advanced Reporting**: View and filter operational data and team productivity.

## Technology Stack

The application is built with a modern, type-safe stack. It uses **React Native** and **Expo** for cross-platform development, **TypeScript** for robust code, and **Expo Router** for file-based navigation. State is managed with **React Hooks**, and the UI is enhanced with **React Native Reanimated**, **Gesture Handler**, and **React Native Maps**.

## Architecture

The architecture is designed to be scalable, maintainable, and easy for new developers to understand.

-   **Feature-Based Structure**: Code is organized by domain features (`/app/admin/projects`, `/app/pilot/incidents`) rather than by technical layers, making it highly modular.
-   **Role-Based Separation**: Clear separation of UI and logic for `Admin` and `Pilot` roles, managed through nested layouts in Expo Router.
-   **Shared Type System**: A centralized `src/types` directory provides a single source of truth for all data models, ensuring type safety across the application.
-   **Component-Driven UI**: A `components/` directory contains reusable UI elements shared across different screens and roles, promoting consistency and DRY principles.

### Project Structure
```
media-aerea-proposal/
├── app/                  # Expo Router file-based routes
│   ├── admin/            # Admin role screens and layout
│   ├── pilot/            # Pilot role screens and layout
│   └── _layout.tsx       # Root layout
├── assets/               # Static assets (fonts, images)
├── components/           # Reusable UI components
├── constants/            # App-wide constants
├── hooks/                # Custom React hooks
├── src/
│   └── types/            # Shared TypeScript type definitions
├── package.json
└── README.md
```

## Getting Started

Follow these instructions to get the project running on your local machine for development and testing.

### Prerequisites
-   Node.js (v18 or higher)
-   Yarn or npm
-   Expo CLI (`npm install -g @expo/cli`)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/emonca19/media-aerea-proposal.git
    cd media-aerea-proposal
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm start
    ```
2.  Follow the instructions in the terminal to launch the app:
    -   Press `a` to run on an **Android Emulator**.
    -   Press `i` to run on the **iOS Simulator** (macOS only).
    -   Press `w` to run in a **Web Browser**.
    -   Scan the QR code with the **Expo Go app** on your physical device.

## Project Context

This platform was created as the winning entry for the **["Jóvenes Impulsando la Industria"](https://economiayturismo.sonora.gob.mx/component/content/article/jovenes-impulsando-la-industria-cajeme?catid=13&Itemid=101)** competition, an initiative by the Government of Sonora through key institutions like **COECYT**. The program challenges university students to build solutions for real local companies.

Our team from the **[Instituto Tecnológico de Sonora (ITSON)](https://www.facebook.com/photo.php?fbid=1163497842486143&id=100064778138392&set=a.639826484853284)** was tasked with designing a system to modernize the operational processes for **[MediaAérea Drone Solutions](https://www.mediaaerea.com.mx/)**. The project's goal was to deliver a comprehensive system design and a functional frontend prototype. This repository represents that final deliverable: a robust foundation that demonstrates the complete user flow and a scalable architecture, establishing a clear path for future full-stack implementation.

## License

This project was developed for a private company as part of an academic competition. The code is shared publicly for demonstration purposes only. All rights are reserved.
