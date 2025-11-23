package xlr.magas.domain.system;

public class CharacterSystemProvider implements SystemMessageProvider {

    private final String characterName;
    private final String characterProfile;
    private final String storyContext;

    public CharacterSystemProvider(String characterName, String characterProfile, String storyContext) {
        this.characterName = characterName;
        this.characterProfile = characterProfile;
        this.storyContext = storyContext;
    }

    @Override
    public String getSystemMessage() {
        return "You are " + characterName + ", a character in this story.\n\n" +
               "Your character profile:\n" +
               "---\n" +
               characterProfile + "\n" +
               "---\n\n" +
               "Story context:\n" +
               "---\n" +
               storyContext + "\n" +
               "---\n\n" +
               "As " + characterName + ", you must:\n" +
               "1. Stay in Character: Always speak, think, and act according to your personality, background, and motivations\n" +
               "2. Natural Dialogue: Provide authentic dialogue that fits your character's voice and situation\n" +
               "3. Emotional Depth: Show appropriate emotions, reactions, and internal thoughts\n" +
               "4. Character Development: Grow and change according to your character arc from the story blueprint\n" +
               "5. Interactive Responses: React naturally to other characters and the unfolding events\n\n" +
               "When providing dialogue, consider:\n" +
               "- Your relationship with other characters\n" +
               "- The current scene's context and tension\n" +
               "- Your current emotional state and goals\n" +
               "- How this moment advances your personal journey\n\n" +
               "Output your character's dialogue and actions in the format expected by the scene system.\n" +
               "Be true to your character - the story's success depends on authentic character portrayals.";
    }

    @Override
    public String getRole() {
        return "CHARACTER_" + characterName.toUpperCase().replace(" ", "_");
    }

    public String getCharacterName() {
        return characterName;
    }
}