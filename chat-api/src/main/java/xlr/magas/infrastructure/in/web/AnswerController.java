package xlr.magas.infrastructure.in.web;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import xlr.magas.domain.ports.in.GenerateStoryUseCase;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*")
public class AnswerController {

    private final GenerateStoryUseCase generateStoryUseCase;

    public AnswerController(GenerateStoryUseCase generateStoryUseCase) {
        this.generateStoryUseCase = generateStoryUseCase;
    }

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> answer(@RequestParam(value = "question", defaultValue = "Tell me a joke") String question,
                               @RequestParam(value = "language", defaultValue = "English") String language) {
        return generateStoryUseCase.generateStory(question, language);
    }
}
