package xlr.magas.domain.ports.in;

import reactor.core.publisher.Flux;
import xlr.magas.domain.model.Scene;

public interface GenerateStoryUseCase {
    Flux<Scene> generateStory(String topic);
}
