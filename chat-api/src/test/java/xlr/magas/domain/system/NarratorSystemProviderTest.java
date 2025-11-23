package xlr.magas.domain.system;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class NarratorSystemProviderTest {

    @Test
    void shouldReturnCorrectRole() {
        // Given
        String storyBlueprint = "{\"title\":\"Test Story\"}";
        NarratorSystemProvider provider = new NarratorSystemProvider(storyBlueprint);

        // When
        String role = provider.getRole();

        // Then
        assertThat(role).isEqualTo("NARRATOR_SYSTEM");
    }

    @Test
    void shouldReturnNonEmptyRole() {
        // Given
        String storyBlueprint = "Some blueprint content";
        NarratorSystemProvider provider = new NarratorSystemProvider(storyBlueprint);

        // When
        String role = provider.getRole();

        // Then
        assertThat(role).isNotNull();
        assertThat(role).isNotEmpty();
    }

    @Test
    void shouldReturnConsistentRole() {
        // Given
        String storyBlueprint = "Blueprint content";
        NarratorSystemProvider provider = new NarratorSystemProvider(storyBlueprint);

        // When
        String role1 = provider.getRole();
        String role2 = provider.getRole();
        String role3 = provider.getRole();

        // Then
        assertThat(role1).isEqualTo(role2).isEqualTo(role3);
    }

    @Test
    void shouldReturnSameRoleRegardlessOfBlueprint() {
        // Given
        NarratorSystemProvider provider1 = new NarratorSystemProvider("Blueprint 1");
        NarratorSystemProvider provider2 = new NarratorSystemProvider("Blueprint 2");
        NarratorSystemProvider provider3 = new NarratorSystemProvider("");

        // When
        String role1 = provider1.getRole();
        String role2 = provider2.getRole();
        String role3 = provider3.getRole();

        // Then
        assertThat(role1).isEqualTo("NARRATOR_SYSTEM");
        assertThat(role2).isEqualTo("NARRATOR_SYSTEM");
        assertThat(role3).isEqualTo("NARRATOR_SYSTEM");
    }
}