package xlr.magas.infrastructure.out.openai;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OpenAIImageAdapterTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private OpenAIImageAdapter adapter;

    @Test
    void shouldGenerateImage() {
        adapter = new OpenAIImageAdapter(restTemplate, "test-key");

        String prompt = "A magical forest";
        String expectedUrl = "http://image.url";
        
        Map<String, Object> mockResponse = Map.of(
            "data", List.of(Map.of("url", expectedUrl))
        );

        when(restTemplate.exchange(
                eq("https://api.openai.com/v1/images/generations"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(ResponseEntity.ok(mockResponse));

        String result = adapter.generateImage(prompt);

        assertEquals(expectedUrl, result);
    }

    @Test
    void shouldThrowExceptionWhenResponseIsEmpty() {
        adapter = new OpenAIImageAdapter(restTemplate, "test-key");
        String prompt = "A magical forest";

        when(restTemplate.exchange(
                eq("https://api.openai.com/v1/images/generations"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(ResponseEntity.ok(null));

        assertThrows(IllegalStateException.class, () -> adapter.generateImage(prompt));
    }

    @Test
    void shouldThrowExceptionWhenDataIsNull() {
        adapter = new OpenAIImageAdapter(restTemplate, "test-key");
        String prompt = "A magical forest";
        Map<String, Object> mockResponse = Map.of(); // No "data" key

        when(restTemplate.exchange(
                eq("https://api.openai.com/v1/images/generations"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(ResponseEntity.ok(mockResponse));

        assertThrows(IllegalStateException.class, () -> adapter.generateImage(prompt));
    }

    @Test
    void shouldThrowExceptionWhenDataIsEmpty() {
        adapter = new OpenAIImageAdapter(restTemplate, "test-key");
        String prompt = "A magical forest";
        Map<String, Object> mockResponse = Map.of("data", List.of());

        when(restTemplate.exchange(
                eq("https://api.openai.com/v1/images/generations"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(ResponseEntity.ok(mockResponse));

        assertThrows(IllegalStateException.class, () -> adapter.generateImage(prompt));
    }

    @Test
    void shouldThrowExceptionWhenUrlIsNull() {
        adapter = new OpenAIImageAdapter(restTemplate, "test-key");
        String prompt = "A magical forest";
        // Data exists but URL is null
        Map<String, Object> item = new java.util.HashMap<>();
        item.put("url", null);
        Map<String, Object> mockResponse = Map.of("data", List.of(item));

        when(restTemplate.exchange(
                eq("https://api.openai.com/v1/images/generations"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(ResponseEntity.ok(mockResponse));

        assertThrows(IllegalStateException.class, () -> adapter.generateImage(prompt));
    }
}
