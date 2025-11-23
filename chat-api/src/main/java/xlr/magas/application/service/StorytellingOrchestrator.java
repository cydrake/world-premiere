package xlr.magas.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import xlr.magas.domain.model.Scene;
import xlr.magas.domain.model.StoryBlueprint;
import xlr.magas.domain.ports.out.ChatModelPort;
import xlr.magas.domain.system.*;

@Service
public class StorytellingOrchestrator {

    private final ChatModelPort chatModelPort;
    private final GodSystemProvider godSystemProvider;
    private final ObjectMapper objectMapper;

    public StorytellingOrchestrator(ChatModelPort chatModelPort,
                                   GodSystemProvider godSystemProvider,
                                   ObjectMapper objectMapper) {
        this.chatModelPort = chatModelPort;
        this.godSystemProvider = godSystemProvider;
        this.objectMapper = objectMapper;
    }

    public Flux<String> createStoryBlueprint(String topic) {
        String systemMessage = godSystemProvider.getSystemMessage();
        String userMessage = String.format("Create a comprehensive story blueprint for a story about: %s", topic);

        return chatModelPort.askChatModel(systemMessage, userMessage);
    }

    public StoryBlueprint parseStoryBlueprint(String blueprintJson) {
        try {
            return objectMapper.readValue(blueprintJson, StoryBlueprint.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse story blueprint: " + e.getMessage(), e);
        }
    }

    public CharacterSystemProvider[] createCharacterSystems(StoryBlueprint blueprint) {
        return blueprint.characters().stream()
                .map(character -> {
                    String characterProfile = String.format("""
                        Name: %s
                        Background: %s
                        Personality: %s
                        Motivations: %s
                        Relationships: %s
                        Development Arc: %s
                        """, character.name(), character.background(),
                           character.personality(), character.motivations(),
                           character.relationships(), character.developmentArc());

                    String storyContext = String.format("""
                        Story Title: %s
                        Genre: %s
                        Tone: %s
                        Themes: %s
                        World Setting: %s
                        """, blueprint.title(), blueprint.genre(), blueprint.tone(),
                           String.join(", ", blueprint.themes()), blueprint.worldSetting().toString());

                    return new CharacterSystemProvider(character.name(), characterProfile, storyContext);
                })
                .toArray(CharacterSystemProvider[]::new);
    }

    public Flux<String> generateScenes(StoryBlueprint blueprint, int numberOfScenes) {
        String blueprintJson;
        try {
            blueprintJson = objectMapper.writeValueAsString(blueprint);
        } catch (Exception e) {
            blueprintJson = blueprint.toString(); // Fallback to toString
        }

        NarratorSystemProvider narratorSystem = new NarratorSystemProvider(blueprintJson);

        // TODO: Implement character systems for individual character interactions
        // CharacterSystemProvider[] characterSystems = createCharacterSystems(blueprint);

        String narratorSystemMessage = narratorSystem.getSystemMessage();
        String userMessage = String.format(
            "Using the story blueprint provided, create %d compelling scenes for this story.\n" +
            "Each scene should advance the plot and include character interactions.\n\n" +
            "For each scene, provide:\n" +
            "1. Scene title and setting\n" +
            "2. Narrative description\n" +
            "3. Character dialogue and actions\n\n" +
            "Remember to stay true to the characters' personalities and the story's themes.\n" +
            "Output each scene as a separate JSON object.",
            numberOfScenes
        );

        return chatModelPort.askChatModel(narratorSystemMessage, userMessage + "\n\nStory Blueprint:\n" + blueprintJson);
    }
}