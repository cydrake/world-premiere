# World Premiere

**World Premiere** is an AI-powered bedtime story generator. Simply describe the kind of story you want to create, and the application will weave a unique tale just for you.

This repository contains the source code for the entire application ecosystem.

## Projects

The repository is organized into the following projects:

<details>
  <summary><strong>Backend Services</strong></summary>

  - **[chat-api](./chat-api/README.md)**: The core backend API.
    - **Tech Stack**: Java 21, Spring Boot 3.2, Spring AI.
    - **Architecture**: Hexagonal Architecture (Ports & Adapters).
    - **Features**: Server-Sent Events (SSE) for real-time story streaming, OpenAI integration.
  - **chat-bff**: Backend for Frontend service (Planned).
</details>

<details>
  <summary><strong>Frontend Applications</strong></summary>

  - **[chat-spa](./chat-spa/README.md)**: The web interface.
    - **Tech Stack**: Next.js 14, TypeScript, Tailwind CSS.
    - **Features**: Modern chat UI, responsive design, streaming message support.
  - **chat-android**: Android mobile application (Planned).
  - **chat-ios**: iOS mobile application (Planned).
</details>

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Java 21 (for local backend dev)
- Node.js 18+ (for local frontend dev)
- OpenAI API Key

### Running with Docker Compose

The easiest way to run the full stack is using Docker Compose.

1.  **Configure Environment**:
    Create a `.env` file in `chat-api/` with your OpenAI key:
    ```properties
    SPRING_AI_OPENAI_API_KEY=sk-your-api-key-here
    ```

2.  **Run the Application**:
    ```bash
    docker-compose up --build
    ```

3.  **Access the Services**:
    - **Frontend (SPA)**: [http://localhost:3000](http://localhost:3000)
    - **Backend API**: [http://localhost:8080](http://localhost:8080)

## Architecture Highlights

- **Reactive Streaming**: The system uses Spring WebFlux and Server-Sent Events (SSE) to stream story generation token-by-token from the LLM to the UI.
- **Clean Architecture**: The backend follows Hexagonal Architecture principles to keep domain logic isolated from framework and infrastructure concerns.
