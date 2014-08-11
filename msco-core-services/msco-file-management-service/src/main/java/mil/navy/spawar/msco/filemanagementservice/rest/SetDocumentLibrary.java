package mil.navy.spawar.msco.filemanagementservice.rest;

import mil.navy.spawar.msco.filemanagementservice.FileManagementService;

import org.json.JSONObject;
import org.restlet.resource.Post;
import org.restlet.resource.ServerResource;

public class SetDocumentLibrary extends ServerResource {
	 /**
     * Respond to service requests for Setting the Document Library
     * 
     * @return result of the request
     */
	@Post
	public String handlePost() {
		JSONObject result = new JSONObject();
		result.put("result", FileManagementService.getInstance().setDocumentLibrary(getAttribute("libraryName")));
		
		return result.toString();
    }
}

