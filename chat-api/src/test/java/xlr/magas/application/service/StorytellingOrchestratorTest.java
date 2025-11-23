package xlr.magas.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;
import xlr.magas.domain.model.StoryBlueprint;
import xlr.magas.domain.ports.out.ChatModelPort;
import xlr.magas.domain.system.CharacterSystemProvider;
import xlr.magas.domain.system.GodSystemProvider;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StorytellingOrchestratorTest {

    @Mock
    private ChatModelPort chatModelPort;

    @Mock
    private GodSystemProvider godSystemProvider;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private StorytellingOrchestrator storytellingOrchestrator;

    @Test
    void shouldCreateStoryBlueprint() {
        // Given
        String topic = "dragons";
        String systemMessage = "You are the GOD SYSTEM...";
        String expectedUserMessage = "Create a comprehensive story blueprint for a story about: dragons";
        Flux<String> expectedFlux = Flux.just("blueprint data");

        when(godSystemProvider.getSystemMessage()).thenReturn(systemMessage);
        when(chatModelPort.askChatModel(systemMessage, expectedUserMessage)).thenReturn(expectedFlux);

        // When
        Flux<String> result = storytellingOrchestrator.createStoryBlueprint(topic);

        // Then
        StepVerifier.create(result)
                .expectNext("blueprint data")
                .verifyComplete();

        verify(godSystemProvider).getSystemMessage();
        verify(chatModelPort).askChatModel(systemMessage, expectedUserMessage);
    }

    @Test
    void shouldParseStoryBlueprintSuccessfully() throws Exception {
        // Given
        String blueprintJson = "{\"title\":\"Test Story\",\"genre\":\"Fantasy\",\"tone\":\"Epic\",\"themes\":[\"Adventure\"],\"characters\":[],\"storyArc\":{\"openingHook\":\"\",\"risingAction\":\"\",\"climax\":\"\",\"resolution\":\"\"},\"worldSetting\":{\"primaryLocations\":\"\",\"timePeriod\":\"\",\"culturalContext\":\"\",\"rulesAndMagic\":\"\",\"atmosphere\":\"\"},\"keyPlotPoints\":[]}";
        StoryBlueprint expectedBlueprint = new StoryBlueprint(
                "Test Story",
                "Fantasy",
                "Epic",
                List.of("Adventure"),
                List.of(),
                new StoryBlueprint.StoryArc("", "", "", ""),
                new StoryBlueprint.WorldSetting("", "", "", "", ""),
                List.of()
        );

        when(objectMapper.readValue(blueprintJson, StoryBlueprint.class)).thenReturn(expectedBlueprint);

        // When
        StoryBlueprint result = storytellingOrchestrator.parseStoryBlueprint(blueprintJson);

        // Then
        assertThat(result).isEqualTo(expectedBlueprint);
        verify(objectMapper).readValue(blueprintJson, StoryBlueprint.class);
    }

    @Test
    void shouldThrowRuntimeExceptionWhenParsingFails() throws Exception {
        // Given
        String invalidJson = "invalid json";
        RuntimeException parsingException = new RuntimeException("JSON parsing error");

        when(objectMapper.readValue(invalidJson, StoryBlueprint.class)).thenThrow(parsingException);

        // When & Then
        assertThatThrownBy(() -> storytellingOrchestrator.parseStoryBlueprint(invalidJson))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to parse story blueprint: JSON parsing error")
                .hasCause(parsingException);
    }

    @Test
    void shouldCreateCharacterSystems() {
        // Given
        var characterProfile = new StoryBlueprint.CharacterProfile(
                "Hero",
                "Brave warrior",
                "Courageous",
                "Save the kingdom",
                "Friends with wizard",
                "From peasant to king"
        );

        var worldSetting = new StoryBlueprint.WorldSetting(
                "Medieval kingdom",
                "Middle Ages",
                "European fantasy",
                "Magic exists",
                "Dark and mysterious"
        );

        var blueprint = new StoryBlueprint(
                "Epic Quest",
                "Fantasy",
                "Heroic",
                List.of("Courage", "Friendship"),
                List.of(characterProfile),
                new StoryBlueprint.StoryArc("Call to adventure", "Trials", "Final battle", "Victory"),
                worldSetting,
                List.of("Meet mentor", "Face dragon")
        );

        // When
        CharacterSystemProvider[] result = storytellingOrchestrator.createCharacterSystems(blueprint);

        // Then
        assertThat(result).hasSize(1);
        CharacterSystemProvider characterSystem = result[0];
        assertThat(characterSystem.getCharacterName()).isEqualTo("Hero");

        String systemMessage = characterSystem.getSystemMessage();
        assertThat(systemMessage).contains("You are Hero, a character in this story");
        assertThat(systemMessage).contains("Name: Hero");
        assertThat(systemMessage).contains("Background: Brave warrior");
        assertThat(systemMessage).contains("Personality: Courageous");
        assertThat(systemMessage).contains("Story Title: Epic Quest");
        assertThat(systemMessage).contains("Genre: Fantasy");
        assertThat(systemMessage).contains("World Setting: WorldSetting[primaryLocations=Medieval kingdom, timePeriod=Middle Ages, culturalContext=European fantasy, rulesAndMagic=Magic exists, atmosphere=Dark and mysterious]");
    }

    @Test
    void shouldCreateMultipleCharacterSystems() {
        // Given
        var character1 = new StoryBlueprint.CharacterProfile(
                "Hero", "Brave warrior", "Courageous", "Save kingdom", "Friends with wizard", "Peasant to king"
        );
        var character2 = new StoryBlueprint.CharacterProfile(
                "Villain", "Dark sorcerer", "Evil", "Rule world", "Enemies with hero", "Power hungry to defeated"
        );

        var worldSetting = new StoryBlueprint.WorldSetting("Kingdom", "Medieval", "Fantasy", "Magic", "Dark");

        var blueprint = new StoryBlueprint(
                "Epic Battle",
                "Fantasy",
                "Dark",
                List.of("Power", "Redemption"),
                List.of(character1, character2),
                new StoryBlueprint.StoryArc("", "", "", ""),
                worldSetting,
                List.of()
        );

        // When
        CharacterSystemProvider[] result = storytellingOrchestrator.createCharacterSystems(blueprint);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result[0].getCharacterName()).isEqualTo("Hero");
        assertThat(result[1].getCharacterName()).isEqualTo("Villain");
    }

    @Test
    void shouldGenerateScenes() throws Exception {
        // Given
        var blueprint = new StoryBlueprint(
                "Test Story",
                "Fantasy",
                "Epic",
                List.of("Adventure"),
                List.of(),
                new StoryBlueprint.StoryArc("", "", "", ""),
                new StoryBlueprint.WorldSetting("", "", "", "", ""),
                List.of()
        );

        String blueprintJson = "{\"title\":\"Test Story\"}";
        int numberOfScenes = 3;
        Flux<String> expectedFlux = Flux.just("scene1", "scene2", "scene3");

        when(objectMapper.writeValueAsString(blueprint)).thenReturn(blueprintJson);
        when(chatModelPort.askChatModel(anyString(), anyString())).thenReturn(expectedFlux);

        // When
        Flux<String> result = storytellingOrchestrator.generateScenes(blueprint, numberOfScenes);

        // Then
        StepVerifier.create(result)
                .expectNext("scene1")
                .expectNext("scene2")
                .expectNext("scene3")
                .verifyComplete();

        verify(objectMapper).writeValueAsString(blueprint);
        verify(chatModelPort).askChatModel(anyString(), anyString());
    }

    @Test
    void shouldFallbackToToStringWhenJsonSerializationFails() throws Exception {
        // Given
        var blueprint = new StoryBlueprint(
                "Test Story",
                "Fantasy",
                "Epic",
                List.of("Adventure"),
                List.of(),
                new StoryBlueprint.StoryArc("", "", "", ""),
                new StoryBlueprint.WorldSetting("", "", "", "", ""),
                List.of()
        );

        when(objectMapper.writeValueAsString(blueprint)).thenThrow(new RuntimeException("Serialization failed"));
        when(chatModelPort.askChatModel(anyString(), anyString())).thenReturn(Flux.just("scene data"));

        // When
        Flux<String> result = storytellingOrchestrator.generateScenes(blueprint, 2);

        // Then
        StepVerifier.create(result)
                .expectNext("scene data")
                .verifyComplete();

        verify(objectMapper).writeValueAsString(blueprint);
        verify(chatModelPort).askChatModel(anyString(), anyString());
    }

    @Test
    void shouldGenerateScenesWithCorrectUserMessage() throws Exception {
        // Given
        var blueprint = new StoryBlueprint(
                "Dragon Quest",
                "Fantasy",
                "Epic",
                List.of("Courage", "Friendship"),
                List.of(),
                new StoryBlueprint.StoryArc("", "", "", ""),
                new StoryBlueprint.WorldSetting("", "", "", "", ""),
                List.of()
        );

        String blueprintJson = "{\"title\":\"Dragon Quest\"}";
        int numberOfScenes = 5;

        when(objectMapper.writeValueAsString(blueprint)).thenReturn(blueprintJson);
        when(chatModelPort.askChatModel(anyString(), anyString())).thenReturn(Flux.just("response"));

        // When
        storytellingOrchestrator.generateScenes(blueprint, numberOfScenes);

        // Then
        verify(chatModelPort).askChatModel(
                anyString(), // narrator system message
                eq("Using the story blueprint provided, create 5 compelling scenes for this story.\n" +
                   "Each scene should advance the plot and include character interactions.\n\n" +
                   "For each scene, provide:\n" +
                   "1. Scene title and setting\n" +
                   "2. Narrative description\n" +
                   "3. Character dialogue and actions\n\n" +
                   "Remember to stay true to the characters' personalities and the story's themes.\n" +
                   "Output each scene as a separate JSON object.\n\nStory Blueprint:\n" + blueprintJson)
        );
    }
}