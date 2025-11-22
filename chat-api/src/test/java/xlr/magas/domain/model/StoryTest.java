package xlr.magas.domain.model;

import org.junit.jupiter.api.Test;
import java.util.Collections;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

class StoryTest {

    @Test
    void shouldCreateStory() {
        Scene scene = new Scene(1, "Intro", null, Collections.emptyList());
        List<Scene> scenes = List.of(scene);
        
        Story story = new Story(scenes);

        assertThat(story.scenes()).isEqualTo(scenes);
        assertThat(story.scenes()).hasSize(1);
        assertThat(story.scenes().get(0)).isEqualTo(scene);
    }
}
