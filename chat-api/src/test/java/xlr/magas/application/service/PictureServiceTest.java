package xlr.magas.application.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import xlr.magas.domain.ports.out.ImageModelPort;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PictureServiceTest {

    @Mock
    private ImageModelPort imageModelPort;

    @InjectMocks
    private PictureService pictureService;

    @Test
    void shouldGenerateImage() {
        String prompt = "A magical forest";
        String expectedUrl = "http://image.url";

        when(imageModelPort.generateImage(prompt)).thenReturn(expectedUrl);

        String result = pictureService.generateImage(prompt);

        assertEquals(expectedUrl, result);
        verify(imageModelPort).generateImage(prompt);
    }
}
