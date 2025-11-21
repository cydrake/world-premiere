package xlr.magas.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.knuddels.jtokkit.Encodings;
import com.knuddels.jtokkit.api.ModelType;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xlr.magas.api.StoryConstants;

@RestController
@RequestMapping("/chat")
public class AnswerController {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public AnswerController(ChatClient.Builder builder, ObjectMapper objectMapper) {
        this.chatClient = builder.build();
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public JsonNode answer(@RequestParam(value = "question", defaultValue = "Tell me a joke") String question) {
        System.out.println("Token count: " + countTokens(StoryConstants.SYSTEM_MESSAGE, question));
        try {
            String content = chatClient.prompt()
                    .system(StoryConstants.SYSTEM_MESSAGE)
                    .user("Now, tell me a funny story about " + question)
                    .call()
                    .content();
            return objectMapper.readTree(content);
        } catch (Exception e) {
            return objectMapper.createObjectNode();
        }
    }

    private int countTokens(String system, String user) {
        var registry = Encodings.newDefaultEncodingRegistry();
        var encoding = registry.getEncodingForModel(ModelType.GPT_4O_MINI);
        return encoding.countTokens(system + user);
    }
}
