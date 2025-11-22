package xlr.magas.infrastructure.out.openai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import xlr.magas.domain.ports.out.ImageModelPort;

import java.util.Map;

@Component
public class OpenAIImageAdapter implements ImageModelPort {

    private final RestTemplate restTemplate;
    private final String apiKey;

    public OpenAIImageAdapter(RestTemplate restTemplate, @Value("${spring.ai.openai.api-key}") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
    }

    @Override
    public String generateImage(String prompt) {
        String url = "https://api.openai.com/v1/images/generations";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = Map.of(
                "model", "dall-e-3",
                "prompt", prompt,
                "size", "1024x1024"
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                Map.class
        );

        Map<String, Object> responseBody = response.getBody();
        if (responseBody == null) {
            throw new IllegalStateException("Empty response from image API");
        }

        var data = (java.util.List<Map<String, Object>>) responseBody.get("data");
        if (data == null || data.isEmpty()) {
            throw new IllegalStateException("No image data returned");
        }

        Object first = data.get(0).get("url");
        if (first == null) {
            throw new IllegalStateException("No URL in image data");
        }

        return first.toString();
    }
}
