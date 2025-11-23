package xlr.magas.domain.ports.out;

import reactor.core.publisher.Flux;

public interface ChatModelPort {
    Flux<String> askChatModel(String system, String user);
}
