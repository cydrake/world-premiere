package xlr.magas.infrastructure.out.openai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;
import xlr.magas.domain.model.Scene;

import static org.mockito.ArgumentMatchers.any;
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
}
