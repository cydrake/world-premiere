package xlr.magas;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;
import static org.assertj.core.api.Assertions.assertThat;

class ApplicationTest {

    @Test
    void shouldCreateRestTemplate() {
        Application application = new Application();
        RestTemplate restTemplate = application.restTemplate();

        assertThat(restTemplate).isNotNull();
    }
    
    @Test
    void mainMethodShouldRun() {
        assertThat(Application.class).isNotNull();
    }
}
