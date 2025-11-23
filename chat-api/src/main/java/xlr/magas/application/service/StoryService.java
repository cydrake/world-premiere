package xlr.magas.application.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import xlr.magas.domain.ports.in.GenerateStoryUseCase;
import xlr.magas.domain.ports.out.ChatModelPort;

@Service
public class StoryService implements GenerateStoryUseCase {

    private final ChatModelPort chatModelPort;

    public StoryService(ChatModelPort chatModelPort) {
        this.chatModelPort = chatModelPort;
    }

    @Override
    public Flux<String> generateStory(String topic) {
        // For now, use a simple system message that works with Spring AI
        // TODO: Implement the full 3-tier system once template issues are resolved
        String systemMessage = "You are a helpful AI assistant. Provide engaging, creative responses.";

        System.out.println("Using simple system message for topic: " + topic);
        return chatModelPort.askChatModel(systemMessage, "Tell me a creative story about: " + topic);
    }
}
