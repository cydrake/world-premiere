package xlr.magas.domain.system;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class GodSystemProviderTest {

    private final GodSystemProvider godSystemProvider = new GodSystemProvider();

    @Test
    void shouldReturnGodSystemMessage() {
        // When
        String systemMessage = godSystemProvider.getSystemMessage();

        // Then
        assertThat(systemMessage).isNotNull();
        assertThat(systemMessage).contains("You are the GOD SYSTEM");
        assertThat(systemMessage).contains("supreme storyteller and master of narratives");
        assertThat(systemMessage).contains("architect of worlds");
        assertThat(systemMessage).contains("weaver of fates");
        assertThat(systemMessage).contains("creator of legends");
        assertThat(systemMessage).contains("MAIN CHARACTERS");
        assertThat(systemMessage).contains("STORY ARC");
        assertThat(systemMessage).contains("WORLD SETTING");
        assertThat(systemMessage).contains("THEMES");
        assertThat(systemMessage).contains("CHARACTER DEVELOPMENT ARC");
        assertThat(systemMessage).contains("comprehensive JSON object");
    }

    @Test
    void shouldReturnGodSystemRole() {
        // When
        String role = godSystemProvider.getRole();

        // Then
        assertThat(role).isEqualTo("GOD_SYSTEM");
    }

    @Test
    void shouldReturnConsistentSystemMessage() {
        // When
        String firstCall = godSystemProvider.getSystemMessage();
        String secondCall = godSystemProvider.getSystemMessage();

        // Then
        assertThat(firstCall).isEqualTo(secondCall);
    }

    @Test
    void shouldReturnConsistentRole() {
        // When
        String firstCall = godSystemProvider.getRole();
        String secondCall = godSystemProvider.getRole();

        // Then
        assertThat(firstCall).isEqualTo(secondCall);
    }

    @Test
    void shouldReturnNonEmptySystemMessage() {
        // When
        String systemMessage = godSystemProvider.getSystemMessage();

        // Then
        assertThat(systemMessage).isNotEmpty();
        assertThat(systemMessage.length()).isGreaterThan(100); // Should be a substantial message
    }

    @Test
    void shouldReturnNonEmptyRole() {
        // When
        String role = godSystemProvider.getRole();

        // Then
        assertThat(role).isNotEmpty();
    }
}