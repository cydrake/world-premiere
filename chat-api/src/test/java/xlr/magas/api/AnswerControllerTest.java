package xlr.magas.api;

import org.junit.jupiter.api.Test;
import org.mockito.Answers;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AnswerController.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AnswerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient.Builder chatClientBuilder;

    @Test
    void shouldReturnAnswer() throws Exception {
        when(chatClientBuilder.build().prompt().user(anyString()).call().content()).thenReturn("I am a mock AI");

        mockMvc.perform(get("/chat").param("question", "Hello"))
                .andExpect(status().isOk())
                .andExpect(content().string("I am a mock AI"));
    }

    @Test
    void shouldHandleQuotaError() throws Exception {
        when(chatClientBuilder.build().prompt().user(anyString()).call().content())
                .thenThrow(new RuntimeException("429 - { ... insufficient_quota ... }"));

        mockMvc.perform(get("/chat").param("question", "Hello"))
                .andExpect(status().isOk())
                .andExpect(content().string("There is no credits to OpenIA"));
    }
}
