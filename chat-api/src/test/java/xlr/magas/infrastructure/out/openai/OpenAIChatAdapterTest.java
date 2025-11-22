package xlr.magas.infrastructure.out.openai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.ChatClient.SystemSpec;
import org.springframework.ai.chat.client.ChatClient.UserSpec;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;
import xlr.magas.domain.model.Scene;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OpenAIChatAdapterTest {

    @Mock
    private ChatClient.Builder chatClientBuilder;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient chatClient;

    @BeforeEach
    void setUp() {
        when(chatClientBuilder.build()).thenReturn(chatClient);
    }

    @Test
    void shouldStreamScenes() {
        String json1 = "{\"order\":1,\"title\":\"Scene 1\",\"setting\":null,\"texts\":null}";
        String json2 = "{\"order\":2,\"title\":\"Scene 2\",\"setting\":null,\"texts\":null}";

        when(chatClient.prompt()
                .system(any(java.util.function.Consumer.class))
                .user(any(java.util.function.Consumer.class))
                .stream()
                .content())
                .thenReturn(Flux.just(
                    json1 + "\n",
                    json2
                ));

        ObjectMapper objectMapper = new ObjectMapper();
        OpenAIChatAdapter adapter = new OpenAIChatAdapter(chatClientBuilder, objectMapper);

        Flux<Scene> result = adapter.askChatModel("system", "user");

        StepVerifier.create(result)
                .expectNextMatches(s -> s.order() == 1 && s.title().equals("Scene 1"))
                .expectNextMatches(s -> s.order() == 2 && s.title().equals("Scene 2"))
                .verifyComplete();
    }

    @Test
    void shouldHandleParsingErrors() {
        String validJson = "{\"order\":1,\"title\":\"Scene 1\",\"setting\":null,\"texts\":null}";
        String invalidJson = "{invalid}";

        when(chatClient.prompt()
                .system(any(java.util.function.Consumer.class))
                .user(any(java.util.function.Consumer.class))
                .stream()
                .content())
                .thenReturn(Flux.just(
                    validJson + "\n",
                    invalidJson + "\n"
                ));

        ObjectMapper objectMapper = new ObjectMapper();
        OpenAIChatAdapter adapter = new OpenAIChatAdapter(chatClientBuilder, objectMapper);

        Flux<Scene> result = adapter.askChatModel("system", "user");

        StepVerifier.create(result)
                .expectNextMatches(s -> s.order() == 1 && s.title().equals("Scene 1"))
                // Invalid JSON is logged and skipped
                .verifyComplete();
    }

    @Test
    void shouldHandleStreamErrors() {
        when(chatClient.prompt()
                .system(any(java.util.function.Consumer.class))
                .user(any(java.util.function.Consumer.class))
                .stream()
                .content())
                .thenReturn(Flux.error(new RuntimeException("Upstream error")));

        ObjectMapper objectMapper = new ObjectMapper();
        OpenAIChatAdapter adapter = new OpenAIChatAdapter(chatClientBuilder, objectMapper);

        Flux<Scene> result = adapter.askChatModel("system", "user");

        StepVerifier.create(result)
                .expectError(RuntimeException.class)
                .verify();
    }

    @Test
    void shouldHandlePartialChunks() {
        String part1 = "{\"order\":1,\"ti";
        String part2 = "tle\":\"Scene 1\",\"setting\":null,\"texts\":null}\n";

        when(chatClient.prompt()
                .system(any(java.util.function.Consumer.class))
                .user(any(java.util.function.Consumer.class))
                .stream()
                .content())
                .thenReturn(Flux.just(part1, part2));

        ObjectMapper objectMapper = new ObjectMapper();
        OpenAIChatAdapter adapter = new OpenAIChatAdapter(chatClientBuilder, objectMapper);

        Flux<Scene> result = adapter.askChatModel("system", "user");

        StepVerifier.create(result)
                .expectNextMatches(s -> s.order() == 1 && s.title().equals("Scene 1"))
                .verifyComplete();
    }

    @Test
    void shouldConfigureSystemAndUserSpecs() {
        var requestSpec = chatClient.prompt();
        
        // Ensure fluent API returns the same mock to allow verification on the same object
        when(requestSpec.system(any(java.util.function.Consumer.class))).thenReturn(requestSpec);
        when(requestSpec.user(any(java.util.function.Consumer.class))).thenReturn(requestSpec);
        
        // Mock the stream response
        when(requestSpec.stream().content()).thenReturn(Flux.empty());

        org.mockito.Mockito.clearInvocations(requestSpec);

        ObjectMapper objectMapper = new ObjectMapper();
        OpenAIChatAdapter adapter = new OpenAIChatAdapter(chatClientBuilder, objectMapper);

        adapter.askChatModel("system prompt", "user prompt").subscribe();

        ArgumentCaptor<java.util.function.Consumer<SystemSpec>> systemCaptor = ArgumentCaptor.forClass(java.util.function.Consumer.class);
        verify(requestSpec).system(systemCaptor.capture());
        
        SystemSpec systemSpec = org.mockito.Mockito.mock(SystemSpec.class);
        when(systemSpec.text(any(String.class))).thenReturn(systemSpec);
        systemCaptor.getValue().accept(systemSpec);
        verify(systemSpec).text(org.mockito.ArgumentMatchers.contains("system prompt"));
        verify(systemSpec).param(eq("format"), any());

        ArgumentCaptor<java.util.function.Consumer<UserSpec>> userCaptor = ArgumentCaptor.forClass(java.util.function.Consumer.class);
        verify(requestSpec).user(userCaptor.capture());

        UserSpec userSpec = org.mockito.Mockito.mock(UserSpec.class);
        when(userSpec.text(any(String.class))).thenReturn(userSpec);
        userCaptor.getValue().accept(userSpec);
        verify(userSpec).text("{user}");
        verify(userSpec).param("user", "user prompt");
    }

    @Test
    void shouldIgnoreNonJsonLines() {
        String json1 = "{\"order\":1,\"title\":\"Scene 1\",\"setting\":null,\"texts\":null}";
        
        when(chatClient.prompt()
                .system(any(java.util.function.Consumer.class))
                .user(any(java.util.function.Consumer.class))
                .stream()
                .content())
                .thenReturn(Flux.just(
                    "\n",
                    "Thinking process...\n",
                    json1 + "\n",
                    "   \n"
                ));

        ObjectMapper objectMapper = new ObjectMapper();
        OpenAIChatAdapter adapter = new OpenAIChatAdapter(chatClientBuilder, objectMapper);

        Flux<Scene> result = adapter.askChatModel("system", "user");

        StepVerifier.create(result)
                .expectNextMatches(s -> s.order() == 1)
                .verifyComplete();
    }

    @Test
    void shouldHandleFinalBufferContent() {
        String json1 = "{\"order\":1,\"title\":\"Scene 1\",\"setting\":null,\"texts\":null}";
        
        when(chatClient.prompt()
                .system(any(java.util.function.Consumer.class))
                .user(any(java.util.function.Consumer.class))
                .stream()
                .content())
                .thenReturn(Flux.just(json1));

        ObjectMapper objectMapper = new ObjectMapper();
        OpenAIChatAdapter adapter = new OpenAIChatAdapter(chatClientBuilder, objectMapper);

        Flux<Scene> result = adapter.askChatModel("system", "user");

        StepVerifier.create(result)
                .expectNextMatches(s -> s.order() == 1)
                .verifyComplete();
    }

    @Test
    void shouldIgnoreInvalidFinalBuffer() {
        when(chatClient.prompt()
                .system(any(java.util.function.Consumer.class))
                .user(any(java.util.function.Consumer.class))
                .stream()
                .content())
                .thenReturn(Flux.just("incomplete json"));

        ObjectMapper objectMapper = new ObjectMapper();
        OpenAIChatAdapter adapter = new OpenAIChatAdapter(chatClientBuilder, objectMapper);

        Flux<Scene> result = adapter.askChatModel("system", "user");

        StepVerifier.create(result)
                .verifyComplete();
    }

    @Test
    void shouldIgnoreIncompleteJsonLines() {
        when(chatClient.prompt()
                .system(any(java.util.function.Consumer.class))
                .user(any(java.util.function.Consumer.class))
                .stream()
                .content())
                .thenReturn(Flux.just(
                    "{incomplete json\n"
                ));

        ObjectMapper objectMapper = new ObjectMapper();
        OpenAIChatAdapter adapter = new OpenAIChatAdapter(chatClientBuilder, objectMapper);

        Flux<Scene> result = adapter.askChatModel("system", "user");

        StepVerifier.create(result)
                .verifyComplete();
    }

    @Test
    void shouldIgnoreWhitespaceFinalBuffer() {
        when(chatClient.prompt()
                .system(any(java.util.function.Consumer.class))
                .user(any(java.util.function.Consumer.class))
                .stream()
                .content())
                .thenReturn(Flux.just("   "));

        ObjectMapper objectMapper = new ObjectMapper();
        OpenAIChatAdapter adapter = new OpenAIChatAdapter(chatClientBuilder, objectMapper);

        Flux<Scene> result = adapter.askChatModel("system", "user");

        StepVerifier.create(result)
                .verifyComplete();
    }

    @Test
    void shouldIgnoreIncompleteJsonFinalBuffer() {
        when(chatClient.prompt()
                .system(any(java.util.function.Consumer.class))
                .user(any(java.util.function.Consumer.class))
                .stream()
                .content())
                .thenReturn(Flux.just("{incomplete json"));

        ObjectMapper objectMapper = new ObjectMapper();
        OpenAIChatAdapter adapter = new OpenAIChatAdapter(chatClientBuilder, objectMapper);

        Flux<Scene> result = adapter.askChatModel("system", "user");

        StepVerifier.create(result)
                .verifyComplete();
    }

    @Test
    void shouldHandleInvalidFinalBuffer() {
        when(chatClient.prompt()
                .system(any(java.util.function.Consumer.class))
                .user(any(java.util.function.Consumer.class))
                .stream()
                .content())
                .thenReturn(Flux.just("{invalid}"));

        ObjectMapper objectMapper = new ObjectMapper();
        OpenAIChatAdapter adapter = new OpenAIChatAdapter(chatClientBuilder, objectMapper);

        Flux<Scene> result = adapter.askChatModel("system", "user");

        StepVerifier.create(result)
                .verifyComplete();
    }
}
