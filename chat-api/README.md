# Chat API

This is the backend API for the Chat application, built using Java 21 and Spring Boot with Spring AI.

## Prerequisites

- Java 21 or higher
- Maven
- Docker (optional, for running in a container)
- OpenAI API Key

## Configuration

The application requires an OpenAI API Key to function. You can set this as an environment variable.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API Key | Yes |

## Running the Application

### Local Development

1. Export your API key:
   ```bash
   export OPENAI_API_KEY=sk-your-api-key
   # Or on Windows PowerShell:
   # $env:OPENAI_API_KEY="sk-your-api-key"
   ```

2. Run with Maven:
   ```bash
   mvn spring-boot:run
   ```

The API will be available at `http://localhost:8080/api/v1`.

### Using Docker

1. Build the image:
   ```bash
   docker build -t chat-api .
   ```

2. Run the container:
   ```bash
   docker run -p 8080:8080 -e OPENAI_API_KEY=sk-your-api-key chat-api
   ```

## API Endpoints

### Chat

- **URL**: `/api/v1/chat`
- **Method**: `GET`
- **Query Parameters**:
    - `question` (optional): The question to ask the AI. Defaults to "Tell me a joke".
- **Example**:
  ```bash
  curl "http://localhost:8080/api/v1/chat?question=Hello"
  ```

## Testing

To run the unit tests:

### Local Maven
```bash
mvn test
```

### Docker (Recommended for consistent environment)
If you don't have Java 21 installed locally or want to ensure a clean environment:

```bash
docker run --rm -v "${PWD}:/usr/src/app" -w /usr/src/app maven:3.9-eclipse-temurin-21 mvn test
```
