package xlr.magas.domain.model;

import java.util.List;

public record StoryBlueprint(
    String title,
    String genre,
    String tone,
    List<String> themes,
    List<CharacterProfile> characters,
    StoryArc storyArc,
    WorldSetting worldSetting,
    List<String> keyPlotPoints
) {

    public record CharacterProfile(
        String name,
        String background,
        String personality,
        String motivations,
        String relationships,
        String developmentArc
    ) {}

    public record StoryArc(
        String openingHook,
        String risingAction,
        String climax,
        String resolution
    ) {}

    public record WorldSetting(
        String primaryLocations,
        String timePeriod,
        String culturalContext,
        String rulesAndMagic,
        String atmosphere
    ) {}
}