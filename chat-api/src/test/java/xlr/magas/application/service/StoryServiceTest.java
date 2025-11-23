package xlr.magas.application.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;
import xlr.magas.domain.ports.out.ChatModelPort;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StoryServiceTest {

    @Mock
    private ChatModelPort chatModelPort;

    @InjectMocks
    private StoryService storyService;

    @Test
    void shouldGenerateStreamingStory() {
        // Mock the streaming response from the chat model
        Flux<String> mockStream = Flux.just(
            "data: Once upon a time",
            "data:  there was a dragon",
            "data: [DONE]"
        );

        when(chatModelPort.askChatModel(anyString(), anyString()))
                .thenReturn(mockStream);

        Flux<String> result = storyService.generateStory("dragons");

        StepVerifier.create(result)
                .expectNext("data: Once upon a time")
                .expectNext("data:  there was a dragon")
                .expectNext("data: [DONE]")
                .verifyComplete();

        verify(chatModelPort).askChatModel(anyString(), anyString());
    }

    @Test
    void shouldHandleStreamingError() {
        when(chatModelPort.askChatModel(anyString(), anyString()))
                .thenReturn(Flux.error(new RuntimeException("AI service error")));

        Flux<String> result = storyService.generateStory("dragons");

        StepVerifier.create(result)
                .expectError(RuntimeException.class)
                .verify();

        verify(chatModelPort).askChatModel(anyString(), anyString());
    }
}
