package mil.navy.spawar.msco.common;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtils
{
	private static ObjectMapper mapper = new ObjectMapper();
	private static final Logger logger = LoggerFactory.getLogger(JsonUtils.class);
	
	static
	{
		mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
	}
	
	public static <T> T createFromJsonString(String jsonString, Class<T> classType)
	{
		T result = null;
		
		try
		{
			result = mapper.readValue(jsonString, classType);
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			logger.error("Couldn't parse JSON String", e);
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			logger.error("Couldn't Map JSON String to Object", e);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			logger.error("IO Exception parsing JSON String", e);
		}
		
		return result;
	}
	
	public static <T> List<T> createListFromJsonString(String jsonString, Class<T> classType)
	{
		List<T> result = Collections.emptyList();
		
		try
		{
			result = mapper.readValue(jsonString, mapper.getTypeFactory().constructCollectionType(List.class, classType));
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			logger.error("Couldn't parse JSON String", e);
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			logger.error("Couldn't Map JSON String to Object", e);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			logger.error("IO Exception parsing JSON String", e);
		}
		
		return result;
	}
	
	public static <T> String toJsonString(T input)
	{
		String result = "";
		
		try {
			result = mapper.writeValueAsString(input);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			logger.error("Couldn't convert Object to JSON", e);
		}
		
		return result;
	}
	
	public static <T> String toJsonString(List<T> input)
	{
		String result = "";
		
		try {
			result = mapper.writeValueAsString(input);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			logger.error("Couldn't convert Object to JSON", e);
		}
		
		return result;
	}
}
