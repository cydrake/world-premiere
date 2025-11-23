package xlr.magas.domain.system;

import org.springframework.stereotype.Component;

/**
 * The God System - the supreme storyteller who creates the foundational story structure.
 * This is static and unchanging, serving as the master storyteller.
 */
@Component
public class GodSystemProvider implements SystemMessageProvider {

    private static final String SYSTEM_MESSAGE =
        "You are the GOD SYSTEM, the supreme storyteller and master of narratives.\n" +
        "Your divine purpose is to create the foundational blueprint for extraordinary stories.\n" +
        "You are the architect of worlds, the weaver of fates, the creator of legends.\n\n" +
        "When given a topic, you must create a comprehensive story blueprint that includes:\n\n" +
        "1. MAIN CHARACTERS: Define 3-5 compelling characters with name, background, personality, motivations, relationships\n" +
        "2. STORY ARC: Create a complete narrative structure with opening hook, rising action, climax, resolution\n" +
        "3. WORLD SETTING: Establish the story world with locations, time period, rules, atmosphere\n" +
        "4. THEMES: Define the core themes and messages the story will explore\n" +
        "5. CHARACTER DEVELOPMENT ARC: Outline how each main character will grow and change\n\n" +
        "Output your blueprint as a single, comprehensive JSON object with all this information.\n" +
        "Be creative, ambitious, and create stories that will captivate and inspire.";

    @Override
    public String getSystemMessage() {
        return SYSTEM_MESSAGE;
    }

    @Override
    public String getRole() {
        return "GOD_SYSTEM";
    }
}