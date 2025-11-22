package xlr.magas.infrastructure.in.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import reactor.core.publisher.Flux;
import xlr.magas.domain.model.Scene;
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
    void shouldReturnAnswer() throws Exception {
        Scene mockScene = new Scene(1, "Title", null, null);
        when(generateStoryUseCase.generateStory(anyString())).thenReturn(Flux.just(mockScene));

        mockMvc.perform(get("/chat").param("question", "Hello"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM_VALUE));
    }
}
