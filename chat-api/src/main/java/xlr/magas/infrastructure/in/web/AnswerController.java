package xlr.magas.infrastructure.in.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xlr.magas.domain.model.Story;
import xlr.magas.domain.ports.in.GenerateStoryUseCase;

@RestController
@RequestMapping("/chat")
public class AnswerController {

    private final GenerateStoryUseCase generateStoryUseCase;

    public AnswerController(GenerateStoryUseCase generateStoryUseCase) {
        this.generateStoryUseCase = generateStoryUseCase;
    }

    @GetMapping
    public Story answer(@RequestParam(value = "question", defaultValue = "Tell me a joke") String question) {
        return generateStoryUseCase.generateStory(question);
    }
}
