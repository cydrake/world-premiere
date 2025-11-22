package xlr.magas.domain.model;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class SettingTest {

    @Test
    void shouldCreateSetting() {
        Setting setting = new Setting("Exterior", "Castle", "Night");

        assertThat(setting.position()).isEqualTo("Exterior");
        assertThat(setting.location()).isEqualTo("Castle");
        assertThat(setting.time()).isEqualTo("Night");
    }
}
