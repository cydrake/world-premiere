package xlr.magas.domain.model;

import java.util.List;

public record Scene(
    int order,
    String title,
    Setting setting,
    List<Text> texts
) {}
