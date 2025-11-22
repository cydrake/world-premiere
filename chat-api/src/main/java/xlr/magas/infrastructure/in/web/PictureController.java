package xlr.magas.infrastructure.in.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xlr.magas.domain.ports.in.GenerateImageUseCase;

import java.util.Map;

@RestController
@RequestMapping("/picture")
public class PictureController {

    private final GenerateImageUseCase generateImageUseCase;

    public PictureController(GenerateImageUseCase generateImageUseCase) {
        this.generateImageUseCase = generateImageUseCase;
    }

    @GetMapping
    public Map<String, String> generatePicture(@RequestParam("prompt") String prompt) {
        try {
            String url = generateImageUseCase.generateImage(prompt);
            return Map.of("status", "ok", "url", url);
        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }
}
