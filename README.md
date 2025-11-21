# World Premiere

**World Premiere** is an AI-powered bedtime story generator. Simply describe the kind of story you want to create, and the application will weave a unique tale just for you.

This repository contains the source code for the entire application ecosystem.

## Projects

The repository is organized into the following projects:

<details>
  <summary><strong>Backend Services</strong></summary>

  - **[chat-api](./chat-api/README.md)**: The backend API built with Java and Spring Boot / Spring AI.
  - **chat-bff**: Backend for Frontend service.
</details>

<details>
  <summary><strong>Frontend Applications</strong></summary>

  - **[chat-spa](./chat-spa/README.md)**: The Single Page Application (Frontend).
  - **chat-android**: Android mobile application.
  - **chat-ios**: iOS mobile application.
</details>

## Getting Started

Please refer to the individual project READMEs for specific instructions on how to configure, run, and test each component.

## Running the Ecosystem

You can run the entire ecosystem (or currently configured services) using Docker Compose.

1. Ensure you have Docker and Docker Compose installed.
2. Create necessary environment files (e.g., `chat-api/.env`) as described in project READMEs.
3. Run the following command from the root directory:

```bash
docker-compose up --build
```

This will build and start all services defined in `docker-compose.yml`.
