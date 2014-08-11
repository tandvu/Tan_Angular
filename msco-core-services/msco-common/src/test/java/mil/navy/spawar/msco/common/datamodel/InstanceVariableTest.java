package mil.navy.spawar.msco.common.datamodel;

import java.io.IOException;

import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.datamodel.InstanceVariable;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static junit.framework.Assert.*;

public class InstanceVariableTest {

	private static final String INSTANCE_VARIABLE_JSON = "{\"_id\": \"53ad89ba2ec778e13ce6ed61\", " +
												 	  	  "\"processInstanceId\": \"53ad8f722ec778e13ce6ed69\", " +
												 	  	  "\"name\" : \"My Task Variable Name\", " +
												 	  	  "\"value\" : \"42\" }"; 
	
	private static final Logger logger = LoggerFactory.getLogger(InstanceVariableTest.class);
	
	@Test
    public void createInstanceVariableFromJsonString() throws IOException
    {		
		
		InstanceVariable instanceVariable = JsonUtils.createFromJsonString(INSTANCE_VARIABLE_JSON, InstanceVariable.class);
		
		assertNotNull(instanceVariable);
		
		logger.debug("InstanceVariableTest JSON String: " + INSTANCE_VARIABLE_JSON);
		logger.debug("InstanceVariable Object As JSON: " + instanceVariable.toJsonString());
		
		assertTrue(instanceVariable.getValue().equals("42"));
    }
}
