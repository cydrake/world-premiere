package xlr.magas.application.service;

import com.knuddels.jtokkit.Encodings;
import com.knuddels.jtokkit.api.ModelType;
import org.springframework.stereotype.Service;
import xlr.magas.domain.model.Story;
import xlr.magas.domain.ports.in.GenerateStoryUseCase;
import xlr.magas.domain.ports.out.ChatModelPort;

@Service
public class StoryService implements GenerateStoryUseCase {

    private final ChatModelPort chatModelPort;
    private static final String SYSTEM_MESSAGE = """
        You are a highly acclaimed author with several bestsellers.
        The story needs to have cohesion and coherence and contain more than 20 scenes.
    """;

    public StoryService(ChatModelPort chatModelPort) {
        this.chatModelPort = chatModelPort;
    }

    @Override
    public Story generateStory(String topic) {
        System.out.println("Token count: " + countTokens(SYSTEM_MESSAGE, topic));
        return chatModelPort.askChatModel(SYSTEM_MESSAGE, "Now, tell me a funny story about " + topic);
    }

    private int countTokens(String system, String user) {
        var registry = Encodings.newDefaultEncodingRegistry();
        var encoding = registry.getEncodingForModel(ModelType.GPT_4O_MINI);
        return encoding.countTokens(system + user);
    }
}
