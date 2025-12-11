# RS Smart Agent - Hospital Management System

A hierarchical AI Agent powered by **Google Gemini API**, designed to handle hospital operations including Patient Management, Scheduling, Medical Information (RAG), and Billing/Administration.

## Features

- **Hierarchical Routing**: A central agent routes requests to specialized sub-agents.
- **Function Calling**: Deterministic tool usage using Gemini's structured output capabilities.
- **Live Dashboard**: Interactive UI to view and manage patient/hospital state in real-time.
- **Responsive Design**: Mobile-friendly interface with slide-over dashboard.

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file in the root directory and add your Gemini API Key:
    ```env
    API_KEY=your_google_ai_studio_api_key_here
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

## Tech Stack

- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **AI**: @google/genai SDK
