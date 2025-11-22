package xlr.magas.application.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;
import xlr.magas.domain.model.Scene;
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
    void shouldGenerateStory() {
        Scene scene1 = new Scene(1, "Scene 1", null, null);
        Scene scene2 = new Scene(2, "Scene 2", null, null);
        
        when(chatModelPort.askChatModel(anyString(), anyString()))
                .thenReturn(Flux.just(scene1, scene2));

        Flux<Scene> result = storyService.generateStory("dragons");

        StepVerifier.create(result)
                .expectNext(scene1)
                .expectNext(scene2)
                .verifyComplete();

        verify(chatModelPort).askChatModel(anyString(), anyString());
    }
}
