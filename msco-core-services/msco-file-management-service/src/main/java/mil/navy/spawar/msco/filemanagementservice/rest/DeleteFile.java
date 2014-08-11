package mil.navy.spawar.msco.filemanagementservice.rest;

import mil.navy.spawar.msco.filemanagementservice.FileManagementService;

import org.json.JSONObject;
import org.restlet.resource.Delete;
import org.restlet.resource.ServerResource;

public class DeleteFile extends ServerResource {
	 /**
     * Respond to service requests for Deleting Files
     * 
     * @return result of the request
     */
	@Delete("json")
	public String handleDelete(String value) {
		JSONObject requestBody = new JSONObject(value);
		
		boolean result = false;
		
		if (requestBody.has("path") && requestBody.has("name"))
		{
			String path = requestBody.getString("path"); // Path is of the form /{Execution|Planning}/Exercise/Mission/{Task}/{Role}
			String name = requestBody.getString("name");
			
			if(path != null && name != null)
			{
				result = FileManagementService.getInstance().deleteDataProduct(name, path);
			}
		}
			
		JSONObject jsonResult = new JSONObject();
		jsonResult.put("result", result);
		
		return jsonResult.toString();
	}
}


