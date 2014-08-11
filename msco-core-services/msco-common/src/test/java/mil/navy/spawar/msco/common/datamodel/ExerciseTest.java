package mil.navy.spawar.msco.common.datamodel;

import java.io.IOException;

import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.datamodel.Exercise;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static junit.framework.Assert.*;

public class ExerciseTest {
	private static final String EXERCISE_JSON = "{\"_id\": \"53a069f14d20240000b2f543\", " +
												 "\"name\": \"myExercise1\", " +
												 "\"command\": \"SSCPAC\", " +
												 "\"description\": \"Planner\", " +
												 "\"poc\": { \"name\": \"Matt\", " +
												 			 "\"email\": \"matt@matt.com\", " +
												 			 "\"phone\" : \"555-233-1212\" }, " +											
												 "\"startTime\": \"2014-06-16 11:16:49\", " +
												 "\"stopTime\": \"2014-06-18 11:16:49\", " +
												 "\"vmWorkingStatus\": {  \"status\": \"OK\", " +
												 						 "\"currentStage\": \"Complete\", " +
												 						 "\"endStage\": \"Complete\", " +
												 						 "\"percentComplete\": \"100\", " +
												 						 "\"statusDescription\" : \"EverthingInItsRightPlace\" }, " + 
												 "\"filepath\": \"/my/path\", " +
												 "\"time\" : \"2014-06-17 11:16:49\" }";
	
	private static final String PARTIAL_EXERCISE_JSON = "{ \"name\": \"myExercise1\", " +
															"\"description\": \"Planner\", " +
															 "\"poc\": { \"name\": \"Matt\", " +
															 			 "\"email\": \"matt@matt.com\", " +
															 			 "\"phone\" : \"555-233-1212\" }, " +											
															"\"filepath\": \"/my/path\" }"; 
	
	private static final Logger logger = LoggerFactory.getLogger(ExerciseTest.class);
	
	@Test
    public void createExerciseFromJsonString() throws IOException
    {		
		Exercise exercise = JsonUtils.createFromJsonString(EXERCISE_JSON, Exercise.class);
		
		assertNotNull(exercise);
		
		logger.debug("ExerciseTest JSON String: " + EXERCISE_JSON);
		logger.debug("Exercise Object as JSON: " + exercise.toJsonString());
		
		assertTrue(exercise.get_id().equals("53a069f14d20240000b2f543"));
    }
	
	@Test
    public void createExerciseFromPartialJsonString() throws IOException
    {		
		Exercise exercise = JsonUtils.createFromJsonString(PARTIAL_EXERCISE_JSON, Exercise.class);
		
		assertNotNull(exercise);
		
		logger.debug("ExerciseTest Partial JSON String: " + PARTIAL_EXERCISE_JSON);
		logger.debug("Exercise Object as JSON: " + exercise.toJsonString());
		
		assertTrue(exercise.getName().equals("myExercise1"));
    }
}
