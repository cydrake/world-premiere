package xlr.magas.domain.ports.out;

import reactor.core.publisher.Flux;
import xlr.magas.domain.model.Scene;

public interface ChatModelPort {
    Flux<Scene> askChatModel(String system, String user);
}
