package mil.navy.spawar.msco.processautomationservice;

import java.io.IOException;

import org.junit.Test;
import static junit.framework.Assert.*;

public class ProcessAutomationConfigurationServiceTest {
	private static final String PROPERTIES_FILE_PATH = "pas-config.properties";
	
	@Test
    public void createConfiguration() throws IOException {
		
		ProcessAutomationServiceConfiguration config = 
				new ProcessAutomationServiceConfiguration(PROPERTIES_FILE_PATH);
		
		assertTrue(config.isEnabled());
    }
}
