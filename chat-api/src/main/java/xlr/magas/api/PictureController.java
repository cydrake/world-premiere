package xlr.magas.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/picture")
public class PictureController {

    private final ImageService imageService;

    public PictureController(ImageService imageService) {
        this.imageService = imageService;
    }

    @GetMapping
    public Map<String, String> generatePicture(@RequestParam("prompt") String prompt) {
        try {
            String url = imageService.generateImageUrl(prompt);
            return Map.of("status", "ok", "url", url);
        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }
}
