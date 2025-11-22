package xlr.magas.domain.model;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class TextTest {

    @Test
    void shouldCreateText() {
        Text text = new Text("Narration", "Narrator", "Neutral", "Once upon a time...");

        assertThat(text.type()).isEqualTo("Narration");
        assertThat(text.character()).isEqualTo("Narrator");
        assertThat(text.tone()).isEqualTo("Neutral");
        assertThat(text.text()).isEqualTo("Once upon a time...");
    }
}
