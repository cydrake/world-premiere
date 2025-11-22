package xlr.magas.infrastructure.out.openai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import xlr.magas.domain.model.Scene;
import xlr.magas.domain.ports.out.ChatModelPort;

@Component
public class OpenAIChatAdapter implements ChatModelPort {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public OpenAIChatAdapter(ChatClient.Builder builder, ObjectMapper objectMapper) {
        this.chatClient = builder.build();
        this.objectMapper = objectMapper;
    }

    @Override
    public Flux<Scene> askChatModel(String system, String user) {
        var converter = new BeanOutputConverter<>(Scene.class);
        return Flux.create(sink -> {
            StringBuilder buffer = new StringBuilder();
            chatClient.prompt()
                    .system(s -> s.text(system + "\n{format}").param("format", converter.getFormat()))
                    .user(u -> u.text("{user}").param("user", user))
                    .stream()
                    .content()
                    .subscribe(
                            chunk -> {
                                System.out.println("DEBUG: Received chunk: " + chunk);
                                buffer.append(chunk);
                                int newlineIndex;
                                while ((newlineIndex = buffer.indexOf("\n")) != -1) {
                                    String line = buffer.substring(0, newlineIndex).trim();
                                    buffer.delete(0, newlineIndex + 1);
                                    if (!line.isEmpty() && line.startsWith("{") && line.endsWith("}")) {
                                        try {
                                            System.out.println("DEBUG: Emitting scene: " + line);
                                            sink.next(objectMapper.readValue(line, Scene.class));
                                        } catch (Exception e) {
                                            System.err.println("Failed to parse line: " + line);
                                        }
                                    }
                                }
                            },
                            error -> {
                                System.err.println("DEBUG: Stream error: " + error.getMessage());
                                sink.error(error);
                            },
                            () -> {
                                System.out.println("DEBUG: Stream complete. Buffer content: " + buffer);
                                if (!buffer.isEmpty()) {
                                    String line = buffer.toString().trim();
                                    if (!line.isEmpty() && line.startsWith("{") && line.endsWith("}")) {
                                        try {
                                            sink.next(objectMapper.readValue(line, Scene.class));
                                        } catch (Exception e) {
                                            System.err.println("Failed to parse final line: " + line);
                                        }
                                    }
                                }
                                sink.complete();
                            }
                    );
        });
    }
}
