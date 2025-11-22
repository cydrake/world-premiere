package xlr.magas.domain.ports.in;

import xlr.magas.domain.model.Story;

public interface GenerateStoryUseCase {
    Story generateStory(String topic);
}
