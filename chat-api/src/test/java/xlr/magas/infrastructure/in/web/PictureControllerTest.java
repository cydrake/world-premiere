package xlr.magas.infrastructure.in.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import xlr.magas.domain.ports.in.GenerateImageUseCase;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PictureController.class)
class PictureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GenerateImageUseCase generateImageUseCase;

    @Test
    void shouldReturnImageUrlOnSuccess() throws Exception {
        String prompt = "A cute cat";
        String expectedUrl = "http://example.com/cat.jpg";

        when(generateImageUseCase.generateImage(prompt)).thenReturn(expectedUrl);

        mockMvc.perform(get("/picture").param("prompt", prompt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.url").value(expectedUrl));
    }

    @Test
    void shouldReturnErrorOnException() throws Exception {
        String prompt = "A bad prompt";
        String errorMessage = "Something went wrong";

        when(generateImageUseCase.generateImage(anyString())).thenThrow(new RuntimeException(errorMessage));

        mockMvc.perform(get("/picture").param("prompt", prompt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value(errorMessage));
    }
}
