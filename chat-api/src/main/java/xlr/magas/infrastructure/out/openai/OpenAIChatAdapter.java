package xlr.magas.infrastructure.out.openai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import xlr.magas.domain.ports.out.ChatModelPort;

@Component
public class OpenAIChatAdapter implements ChatModelPort {

    private final ChatClient chatClient;

    public OpenAIChatAdapter(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @Override
    public Flux<String> askChatModel(String system, String user) {
        return chatClient.prompt()
                .system(system)
                .user(user)
                .stream()
                .content()
                .map(chunk -> {
                    if (chunk == null) return "";
                    return "data: " + chunk.replace("\n", "\ndata: ") + "\n\n";
                })
                .concatWith(Flux.just("data: [DONE]\n\n"));
    }
}
