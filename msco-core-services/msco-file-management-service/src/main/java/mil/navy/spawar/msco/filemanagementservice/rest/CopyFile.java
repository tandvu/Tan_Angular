package mil.navy.spawar.msco.filemanagementservice.rest;

import mil.navy.spawar.msco.common.datamodel.MissionProduct;
import mil.navy.spawar.msco.filemanagementservice.FileManagementService;

import org.json.JSONObject;
import org.restlet.resource.Put;
import org.restlet.resource.ServerResource;

public class CopyFile extends ServerResource {
	 /**
     * Respond to service requests for Copying Files
     * 
     * @return result of the request
     */

	@Put("json")
	public String handlePut(String value) {
		JSONObject requestBody = new JSONObject(value);
		
		MissionProduct copyProduct = null;
		
		if (requestBody.has("source") && requestBody.has("destination"))
		{
			JSONObject source = requestBody.getJSONObject("source");
			JSONObject destination = requestBody.getJSONObject("destination");
			
			String sourceName = source.getString("name"); // Name is fileName
			String sourcePath = source.getString("path"); // Path is of the form /{Execution|Planning}/Exercise/Mission/{Task}/{Role}
			
			String destName = destination.getString("name");
			String destPath = destination.getString("path");
			
			copyProduct = FileManagementService.getInstance().copyDataProduct(sourceName, sourcePath, 
					destName, destPath);
		}

		JSONObject jsonResult = new JSONObject();
		jsonResult.put("result", (copyProduct != null));
		
		if(copyProduct.getPath().startsWith("/"))
		{
			jsonResult.put("path", copyProduct.getPath()); 
		}
		else
		{
			jsonResult.put("path", "/" + copyProduct.getPath()); 
		}
		
		jsonResult.put("filename", copyProduct.getFilename());
		jsonResult.put("url", copyProduct.getUrl());
        
		return jsonResult.toString();
	}
}

