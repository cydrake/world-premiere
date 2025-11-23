package xlr.magas.domain.ports.in;

import reactor.core.publisher.Flux;

public interface GenerateStoryUseCase {
    Flux<String> generateStory(String topic);
}
