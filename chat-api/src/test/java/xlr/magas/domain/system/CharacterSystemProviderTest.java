package xlr.magas.domain.system;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class CharacterSystemProviderTest {

    @Test
    void shouldReturnCorrectRoleForCharacter() {
        // Given
        String characterName = "Hero";
        String characterProfile = "Brave warrior background";
        String storyContext = "Epic fantasy story";
        CharacterSystemProvider provider = new CharacterSystemProvider(characterName, characterProfile, storyContext);

        // When
        String role = provider.getRole();

        // Then
        assertThat(role).isEqualTo("CHARACTER_HERO");
    }

    @Test
    void shouldReturnCorrectRoleForCharacterWithSpaces() {
        // Given
        String characterName = "Dark Lord Voldemort";
        String characterProfile = "Evil wizard";
        String storyContext = "Harry Potter story";
        CharacterSystemProvider provider = new CharacterSystemProvider(characterName, characterProfile, storyContext);

        // When
        String role = provider.getRole();

        // Then
        assertThat(role).isEqualTo("CHARACTER_DARK_LORD_VOLDEMORT");
    }

    @Test
    void shouldReturnCorrectRoleForCharacterWithMixedCase() {
        // Given
        String characterName = "princess Leia";
        String characterProfile = "Rebel leader";
        String storyContext = "Star Wars story";
        CharacterSystemProvider provider = new CharacterSystemProvider(characterName, characterProfile, storyContext);

        // When
        String role = provider.getRole();

        // Then
        assertThat(role).isEqualTo("CHARACTER_PRINCESS_LEIA");
    }

    @Test
    void shouldReturnNonEmptyRole() {
        // Given
        String characterName = "Test";
        String characterProfile = "Test profile";
        String storyContext = "Test context";
        CharacterSystemProvider provider = new CharacterSystemProvider(characterName, characterProfile, storyContext);

        // When
        String role = provider.getRole();

        // Then
        assertThat(role).isNotNull();
        assertThat(role).isNotEmpty();
        assertThat(role).startsWith("CHARACTER_");
    }

    @Test
    void shouldReturnConsistentRole() {
        // Given
        String characterName = "Consistent";
        String characterProfile = "Consistent profile";
        String storyContext = "Consistent context";
        CharacterSystemProvider provider = new CharacterSystemProvider(characterName, characterProfile, storyContext);

        // When
        String role1 = provider.getRole();
        String role2 = provider.getRole();
        String role3 = provider.getRole();

        // Then
        assertThat(role1).isEqualTo(role2).isEqualTo(role3);
    }
}