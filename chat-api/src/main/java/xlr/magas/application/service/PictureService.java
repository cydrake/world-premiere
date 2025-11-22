package xlr.magas.application.service;

import org.springframework.stereotype.Service;
import xlr.magas.domain.ports.in.GenerateImageUseCase;
import xlr.magas.domain.ports.out.ImageModelPort;

@Service
public class PictureService implements GenerateImageUseCase {

    private final ImageModelPort imageModelPort;

    public PictureService(ImageModelPort imageModelPort) {
        this.imageModelPort = imageModelPort;
    }

    @Override
    public String generateImage(String prompt) {
        return imageModelPort.generateImage(prompt);
    }
}
