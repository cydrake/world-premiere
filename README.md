# World Premiere

This repository contains the source code for the World Premiere Chat application ecosystem.

## Projects

The repository is organized into the following projects:

- **[chat-api](./chat-api/README.md)**: The backend API built with Java and Spring Boot / Spring AI.
- **[chat-spa](./chat-spa/README.md)**: The Single Page Application (Frontend).
- **chat-bff**: Backend for Frontend service.
- **chat-android**: Android mobile application.
- **chat-ios**: iOS mobile application.

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
