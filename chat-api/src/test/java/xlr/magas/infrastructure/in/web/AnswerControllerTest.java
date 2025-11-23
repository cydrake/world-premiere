package xlr.magas.infrastructure.in.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import reactor.core.publisher.Flux;
import xlr.magas.domain.ports.in.GenerateStoryUseCase;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AnswerController.class)
class AnswerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GenerateStoryUseCase generateStoryUseCase;

    @Test
    void shouldReturnStreamingAnswer() throws Exception {
        // Mock the streaming response with SSE-formatted chunks
        Flux<String> mockStream = Flux.just(
            "data: Once",
            "data:  upon",
            "data:  a",
            "data:  time",
            "data: [DONE]"
        );
        when(generateStoryUseCase.generateStory(anyString())).thenReturn(mockStream);

        mockMvc.perform(get("/chat").param("question", "Tell me a story"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM_VALUE));
    }

    @Test
    void shouldHandleEmptyQuestionWithDefault() throws Exception {
        Flux<String> mockStream = Flux.just("data: Hello", "data: [DONE]");
        when(generateStoryUseCase.generateStory(anyString())).thenReturn(mockStream);

        mockMvc.perform(get("/chat"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM_VALUE));
    }

    @Test
    void shouldHandleStreamingError() throws Exception {
        // Mock a stream that errors
        Flux<String> errorStream = Flux.error(new RuntimeException("AI service unavailable"));
        when(generateStoryUseCase.generateStory(anyString())).thenReturn(errorStream);

        mockMvc.perform(get("/chat").param("question", "Hello"))
                .andExpect(status().isOk()); // SSE streams return 200 even with errors
    }
}
