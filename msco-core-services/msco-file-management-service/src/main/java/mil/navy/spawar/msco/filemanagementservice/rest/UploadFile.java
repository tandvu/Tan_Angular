package mil.navy.spawar.msco.filemanagementservice.rest;

import java.io.IOException;

import mil.navy.spawar.msco.common.datamodel.MissionProduct;
import mil.navy.spawar.msco.filemanagementservice.FileManagementService;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.json.JSONObject;
import org.restlet.data.Form;
import org.restlet.data.MediaType;
import org.restlet.data.Status;
import org.restlet.ext.fileupload.RestletFileUpload;
import org.restlet.representation.Representation;
import org.restlet.representation.StringRepresentation;
import org.restlet.resource.Post;
import org.restlet.resource.ServerResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UploadFile extends ServerResource {
	 /**
     * Respond to service requests for retrieving Exercises
     * 
     * @return result of the request
     */
	private static final Logger logger = LoggerFactory.getLogger(UploadFile.class);
	
	@Post
    public Representation accept(Representation entity)
    {
        //Get the NAME and PATH from the query parameters
		Form queryParams = getQuery();

        String name = queryParams.getFirstValue("name");  // Name is fileName
        String path = queryParams.getFirstValue("path");  // Path is of the form /{Execution|Planning}/Exercise/Mission/{Task}/{Role}

        MissionProduct copyProduct = null;
        
        if (entity != null)
        {
        	if (MediaType.MULTIPART_FORM_DATA.equals(entity.getMediaType(),true))
            {
                DiskFileItemFactory factory = new DiskFileItemFactory();
                RestletFileUpload upload = new RestletFileUpload(factory);
                
                try
                {
	                FileItemIterator iter = upload.getItemIterator(entity);
	
	                while (iter.hasNext())
	                {
	                    FileItemStream item = iter.next();
	                    
	                    if (!item.isFormField())
	                    {
	                    	copyProduct = FileManagementService.getInstance().uploadDataProduct(name, path, 
	                    			item.openStream());
	                    	
	                    	if(copyProduct != null)
	                    	{
	                    		 setStatus(Status.SUCCESS_OK);
	                    	}
	                    	else
	                    	{
	                    		 setStatus(Status.CLIENT_ERROR_BAD_REQUEST);
	                    	}
	                    }
	                }
                }
                catch(IOException e)
                {
                	logger.error("IO Error during File Upload", e);
                }
                catch(FileUploadException fue)
                {
                	logger.error("Error during File Upload", fue);
                }
            }
        } else {
            // POST request with no entity.
            setStatus(Status.CLIENT_ERROR_BAD_REQUEST);
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
		
		return new StringRepresentation(jsonResult.toString(), MediaType.APPLICATION_JSON);
    }
}