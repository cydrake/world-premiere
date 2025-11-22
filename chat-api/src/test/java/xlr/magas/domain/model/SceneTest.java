package xlr.magas.domain.model;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

class SceneTest {

    @Test
    void shouldCreateScene() {
        Setting setting = new Setting("Day", "Forest", "Noon");
        Text text = new Text("Dialogue", "Hero", "Brave", "Hello!");
        List<Text> texts = List.of(text);
        
        Scene scene = new Scene(1, "Chapter 1", setting, texts);

        assertThat(scene.order()).isEqualTo(1);
        assertThat(scene.title()).isEqualTo("Chapter 1");
        assertThat(scene.setting()).isEqualTo(setting);
        assertThat(scene.texts()).isEqualTo(texts);
    }
}
