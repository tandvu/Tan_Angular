package mil.navy.spawar.msco.filemanagementservice.rest;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

import java.util.List;

import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.datamodel.DataProduct;
import mil.navy.spawar.msco.filemanagementservice.FileManagementService;

import org.json.JSONObject;
import org.restlet.resource.Get;
import org.restlet.resource.Post;
import org.restlet.resource.ServerResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A class to handle service requests for creating folders and retrieving their contents
 */
public class ManageFolders extends ServerResource{
    /**
     * Respond to service requests for retrieving folder contents
     * 
     * @return result of the request
     */
	private static final Logger logger = LoggerFactory.getLogger(ManageFolders.class);
	
	@Get
	public String getDataProductsInFolder() {
		String storageArea = getAttribute("storageArea");
		String exerciseName = getAttribute("exerciseName");
		String missionName  = getAttribute("missionName");
		String taskName  = getAttribute("taskName");
		String roleAssignment  = getAttribute("roleAssignment");

		// Need to URL Decode the path/names
		try
		{
			if(storageArea != null)
			{
				storageArea = URLDecoder.decode(storageArea, "utf-8");
			}
			
			if(exerciseName != null)
			{
				exerciseName = URLDecoder.decode(exerciseName, "utf-8");
			}
			
			if(missionName != null)
			{	
				missionName = URLDecoder.decode(missionName, "utf-8");
			}
			
			if(taskName != null)
			{	
				taskName = URLDecoder.decode(taskName, "utf-8");
			}
			
			if(roleAssignment != null)
			{	
				roleAssignment = URLDecoder.decode(roleAssignment, "utf-8");
			}
		} 
		catch (UnsupportedEncodingException e)
		{
			// TODO Auto-generated catch block
			logger.error("Couldn't URLEncode Query String", e);
		}
				
		List<DataProduct> dataProducts = FileManagementService.getInstance().getDataProductList(
				storageArea, exerciseName, missionName, taskName, roleAssignment);
		
		return JsonUtils.toJsonString(dataProducts);
    }
	
	 /**
     * Respond to service requests for creating the specified folder
     * 
     * @return result of the request
     */
	@Post
	public String createFolder() {
		String storageArea = getAttribute("storageArea");
		String exerciseName = getAttribute("exerciseName");
		String missionName  = getAttribute("missionName");
		String taskName  = getAttribute("taskName");
		String roleAssignment  = getAttribute("roleAssignment");
		
		// Need to URL Decode the path/names
		try
		{
			if(storageArea != null)
			{
				storageArea = URLDecoder.decode(storageArea, "utf-8");
			}
			
			if(exerciseName != null)
			{
				exerciseName = URLDecoder.decode(exerciseName, "utf-8");
			}
			
			if(missionName != null)
			{	
				missionName = URLDecoder.decode(missionName, "utf-8");
			}
			
			if(taskName != null)
			{	
				taskName = URLDecoder.decode(taskName, "utf-8");
			}
			
			if(roleAssignment != null)
			{	
				roleAssignment = URLDecoder.decode(roleAssignment, "utf-8");
			}
		} 
		catch (UnsupportedEncodingException e)
		{
			// TODO Auto-generated catch block
			logger.error("Couldn't URLEncode Query String", e);
		}
				
		JSONObject result = new JSONObject();
		result.put("result", FileManagementService.getInstance().createFolder(storageArea, exerciseName, 
				missionName, taskName, roleAssignment));
		
		return result.toString();	
    }
}


