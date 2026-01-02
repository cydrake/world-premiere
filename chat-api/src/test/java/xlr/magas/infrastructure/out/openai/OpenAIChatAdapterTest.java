package xlr.magas.infrastructure.out.openai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;
import xlr.magas.domain.ports.out.ChatModelPort;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OpenAIChatAdapterTest {

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient.Builder chatClientBuilder;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient chatClient;

    private OpenAIChatAdapter adapter;

    @BeforeEach
    void setUp() {
        when(chatClientBuilder.build()).thenReturn(chatClient);
        adapter = new OpenAIChatAdapter(chatClientBuilder);
    }

    @Test
    void shouldReturnFluxOfStrings() {
        // Given
        String systemMessage = "You are a helpful assistant";
        String userMessage = "Tell me a story";
        Flux<String> expectedChunks = Flux.just("Once", " upon", " a", " time");

        when(chatClient.prompt()
                .system(eq(systemMessage))
                .user(eq(userMessage))
                .stream()
                .content())
                .thenReturn(expectedChunks);

        // When
        Flux<String> result = adapter.askChatModel(systemMessage, userMessage);

        // Then
        StepVerifier.create(result)
                .expectNext("data: Once\n\n")
                .expectNext("data:  upon\n\n")
                .expectNext("data:  a\n\n")
                .expectNext("data:  time\n\n")
                .expectNext("data: [DONE]\n\n")
                .verifyComplete();
    }

    @Test
    void shouldHandleEmptyResponseStream() {
        // Given
        String systemMessage = "You are a helpful assistant";
        String userMessage = "Say nothing";

        when(chatClient.prompt()
                .system(eq(systemMessage))
                .user(eq(userMessage))
                .stream()
                .content())
                .thenReturn(Flux.empty());

        // When
        Flux<String> result = adapter.askChatModel(systemMessage, userMessage);

        // Then
        StepVerifier.create(result)
                .expectNext("data: [DONE]\n\n")
                .verifyComplete();
    }

    @Test
    void shouldHandleSingleChunkResponse() {
        // Given
        String systemMessage = "You are a helpful assistant";
        String userMessage = "Say hello";
        String singleChunk = "Hello, world!";

        when(chatClient.prompt()
                .system(eq(systemMessage))
                .user(eq(userMessage))
                .stream()
                .content())
                .thenReturn(Flux.just(singleChunk));

        // When
        Flux<String> result = adapter.askChatModel(systemMessage, userMessage);

        // Then
        StepVerifier.create(result)
                .expectNext("data: Hello, world!\n\n")
                .expectNext("data: [DONE]\n\n")
                .verifyComplete();
    }

    @Test
    void shouldHandleMultipleWordsInChunks() {
        // Given
        String systemMessage = "You are a storyteller";
        String userMessage = "Tell me a short story";
        Flux<String> chunks = Flux.just("In a", " far away", " land,", " there lived", " a dragon.");

        when(chatClient.prompt()
                .system(eq(systemMessage))
                .user(eq(userMessage))
                .stream()
                .content())
                .thenReturn(chunks);

        // When
        Flux<String> result = adapter.askChatModel(systemMessage, userMessage);

        // Then
        StepVerifier.create(result)
                .expectNext("data: In a\n\n")
                .expectNext("data:  far away\n\n")
                .expectNext("data:  land,\n\n")
                .expectNext("data:  there lived\n\n")
                .expectNext("data:  a dragon.\n\n")
                .expectNext("data: [DONE]\n\n")
                .verifyComplete();
    }

    @Test
    void shouldPropagateErrorsFromChatClient() {
        // Given
        String systemMessage = "You are a helpful assistant";
        String userMessage = "Cause an error";
        RuntimeException expectedError = new RuntimeException("AI service unavailable");

        when(chatClient.prompt()
                .system(eq(systemMessage))
                .user(eq(userMessage))
                .stream()
                .content())
                .thenReturn(Flux.error(expectedError));

        // When
        Flux<String> result = adapter.askChatModel(systemMessage, userMessage);

        // Then
        StepVerifier.create(result)
                .expectError(RuntimeException.class)
                .verify();
    }

    @Test
    void shouldHandleSpecialCharactersInChunks() {
        // Given
        String systemMessage = "You are a helpful assistant";
        String userMessage = "Use special characters";
        Flux<String> chunks = Flux.just("Hello!", " ¿Cómo", " estás?", " 100%");

        when(chatClient.prompt()
                .system(eq(systemMessage))
                .user(eq(userMessage))
                .stream()
                .content())
                .thenReturn(chunks);

        // When
        Flux<String> result = adapter.askChatModel(systemMessage, userMessage);

        // Then
        StepVerifier.create(result)
                .expectNext("data: Hello!\n\n")
                .expectNext("data:  ¿Cómo\n\n")
                .expectNext("data:  estás?\n\n")
                .expectNext("data:  100%\n\n")
                .expectNext("data: [DONE]\n\n")
                .verifyComplete();
    }

    @Test
    void shouldImplementChatModelPortInterface() {
        // Given
        ChatClient.Builder builder = mock(ChatClient.Builder.class, Answers.RETURNS_DEEP_STUBS);
        ChatClient mockClient = mock(ChatClient.class, Answers.RETURNS_DEEP_STUBS);

        when(builder.build()).thenReturn(mockClient);
        when(mockClient.prompt()
                .system(any(String.class))
                .user(any(String.class))
                .stream()
                .content())
                .thenReturn(Flux.just("test"));

        // When
        ChatModelPort port = new OpenAIChatAdapter(builder);

        // Then
        assert port instanceof ChatModelPort;
        StepVerifier.create(port.askChatModel("system", "user"))
                .expectNext("data: test\n\n")
                .expectNext("data: [DONE]\n\n")
                .verifyComplete();
    }

    @Test
    void shouldHandleChunksWithNewlines() {
        // Given
        String systemMessage = "System";
        String userMessage = "User";
        Flux<String> chunks = Flux.just("Line 1\nLine 2", "\nLine 3");

        when(chatClient.prompt()
                .system(eq(systemMessage))
                .user(eq(userMessage))
                .stream()
                .content())
                .thenReturn(chunks);

        // When
        Flux<String> result = adapter.askChatModel(systemMessage, userMessage);

        // Then
        StepVerifier.create(result)
                .expectNext("data: Line 1\ndata: Line 2\n\n")
                .expectNext("data: \ndata: Line 3\n\n")
                .expectNext("data: [DONE]\n\n")
                .verifyComplete();
    }
}
