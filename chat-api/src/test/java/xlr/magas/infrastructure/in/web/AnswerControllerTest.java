package xlr.magas.infrastructure.in.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import xlr.magas.domain.model.Story;
import xlr.magas.domain.ports.in.GenerateStoryUseCase;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AnswerController.class)
class AnswerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GenerateStoryUseCase generateStoryUseCase;

    @Test
    void shouldReturnAnswer() throws Exception {
        Story mockStory = new Story(List.of());
        when(generateStoryUseCase.generateStory(anyString())).thenReturn(mockStory);

        mockMvc.perform(get("/chat").param("question", "Hello"))
                .andExpect(status().isOk());
    }
}
