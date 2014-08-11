package mil.navy.spawar.msco.common.datamodel;

import java.io.IOException;

import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.datamodel.ErrorLogEntry;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static junit.framework.Assert.*;

public class ErrorLogEntryTest {
	private static final String ERROR_LOG_ENTRY_JSON =  "{ \"_id\": \"53aafc575cc106d60c69904a\", " +
												 		  "\"level\": \"WARNING\", " +
												 		  "\"message\" : \"EverythingInItsRightPlace\", " +
												 		  "\"time\": \"2004-12-12\" " +
												 		  "}"; 
	
	private static final Logger logger = LoggerFactory.getLogger(ErrorLogEntryTest.class);
	
	@Test
    public void createErrorLogEntryFromJsonString() throws IOException
    {	
		ErrorLogEntry errorLogEntry = JsonUtils.createFromJsonString(ERROR_LOG_ENTRY_JSON, 
				ErrorLogEntry.class);
		
		assertNotNull(errorLogEntry);
		
		logger.debug("ErrorLogEntryTest JSON String: " + ERROR_LOG_ENTRY_JSON);
		logger.debug("ErrorLogEntry Object As JSON: " + errorLogEntry.toJsonString());
		
		assertTrue(errorLogEntry.get_id().equals("53aafc575cc106d60c69904a"));
    }
	
	@Test
    public void writeErrorLogEntryAsJsonString() throws IOException
    {		
		ErrorLogEntry errorLogEntry = JsonUtils.createFromJsonString(ERROR_LOG_ENTRY_JSON, 
				ErrorLogEntry.class);
		
		assertNotNull(errorLogEntry);
		
		logger.debug("ErrorLogEntryTest JSON String (No WS): " + ERROR_LOG_ENTRY_JSON.replaceAll("\\s+",""));
		logger.debug("ErrorLogEntry Object As JSON: " + errorLogEntry.toJsonString());
		
		assertTrue(ERROR_LOG_ENTRY_JSON.replaceAll("\\s+","").equals(errorLogEntry.toJsonString()));
    }
}
