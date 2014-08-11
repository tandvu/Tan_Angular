package mil.navy.spawar.msco.common.datamodel;

import java.io.IOException;

import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.datamodel.Process;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static junit.framework.Assert.*;

public class ProcessTest {
	private static final String PROCESS_JSON = "{\"_id\": \"J6PersonnelRecovery.PersonnelRecovery\", " +
												 "\"name\": \"PersonnelRecovery\", " +
												 "\"version\": \"1.0\", " +
												 "\"packageName\": \"fake-packageName\", " +
												 "\"type\": \"fake-type\", " +
												 "\"knowledgeType\": \"PROCESS\", " +
												 "\"namespace\": \"fake-namespace\", " +
												 "\"originalPath\" : \"none\", " +
												 "\"deploymentId\": \"J6.JMT.PersonnelRecovery:J6_Personnel_Recovery:1.0\", " +
												 "\"encodedProcessSource\" : \"none\" "
												 + "}"; 
	
	private static final Logger logger = LoggerFactory.getLogger(ProcessLogEntryTest.class);
	
	@Test
    public void createProcessFromJsonString() throws IOException
    {		
		Process process = JsonUtils.createFromJsonString(PROCESS_JSON, Process.class);
		
		assertNotNull(process);
		
		logger.debug("ProcessTest JSON String: " + PROCESS_JSON);
		logger.debug("Process Object as JSON: " + process.toJsonString());
		
		assertTrue(process.get_id().equals("J6PersonnelRecovery.PersonnelRecovery"));
    }
}
