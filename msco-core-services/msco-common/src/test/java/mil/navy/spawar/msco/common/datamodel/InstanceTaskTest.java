package mil.navy.spawar.msco.common.datamodel;

import java.io.IOException;

import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.datamodel.InstanceTask;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static junit.framework.Assert.*;

public class InstanceTaskTest {

	private static final String INSTANCE_TASK_JSON = "{\"_id\": \"53ad89ba2ec778e13ce6ed61\", " +
												 	  "\"processInstanceId\": \"53ad8f722ec778e13ce6ed69\", " +
												 	  "\"name\" : \"My Instance Task Name\", " +
												 	  "\"role\" : \"some role not restricted\", " +
												 	  "\"user\" : \"some user no relationships\", " +
												 	  "\"state\" : \"some state\", " +
												 	  "\"startTime\" : \"7/1/2014\", " +
												 	  "\"stopTime\" : \"7/1/2014\"}"; 
	
	private static final Logger logger = LoggerFactory.getLogger(InstanceTaskTest.class);
	
	@Test
    public void createInstanceTaskFromJsonString() throws IOException
    {		
		InstanceTask instanceTask = JsonUtils.createFromJsonString(INSTANCE_TASK_JSON, InstanceTask.class);
		
		assertNotNull(instanceTask);
		
		logger.debug("InstanceTaskTest JSON String: " + INSTANCE_TASK_JSON);
		logger.debug("InstanceTask Object As JSON: " + instanceTask.toJsonString());
		
		assertTrue(instanceTask.getProcessInstanceId().equals("53ad8f722ec778e13ce6ed69"));
    }
}

