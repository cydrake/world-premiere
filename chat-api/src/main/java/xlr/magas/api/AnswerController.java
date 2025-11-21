package xlr.magas.api;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chat")
public class AnswerController {

    private final ChatClient chatClient;

    public AnswerController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @GetMapping
    public String answer(@RequestParam(value = "question", defaultValue = "Tell me a joke") String question) {
        try {
            return chatClient.prompt()
                    .user(question)
                    .call()
                    .content();
        } catch (Exception e) {
            if (e.getMessage().contains("insufficient_quota")) {
                return "There is no credits to OpenIA";
            }
            throw e;
        }
    }
}
