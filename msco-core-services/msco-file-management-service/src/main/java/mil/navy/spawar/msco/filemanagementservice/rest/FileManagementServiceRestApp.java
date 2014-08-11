package mil.navy.spawar.msco.filemanagementservice.rest;

import org.restlet.Application;
import org.restlet.Restlet;
import org.restlet.routing.Router;

/**
 * A class to handle service requests for the File Management Service
 */
public class FileManagementServiceRestApp extends Application
{
	/**
	 * Creates router for service requests to the File Management Service
	 *
	 * @return The resulting router Restlet object
	 */
    @Override
    public synchronized Restlet createInboundRoot()
    {
        Router router = new Router(getContext());
        
        // POST
        router.attach("/DocumentLibrary/{libraryName}", SetDocumentLibrary.class);
        router.attach("/Upload", UploadFile.class);
        
        // PUT
        router.attach("/Copy", CopyFile.class);
        
        // DELETE
        router.attach("/Delete", DeleteFile.class);
        
        // GET for File Listing, POST to Create Folder
        router.attach("/{storageArea}/{exerciseName}", ManageFolders.class);
        router.attach("/{storageArea}/{exerciseName}/{missionName}", ManageFolders.class);
        router.attach("/{storageArea}/{exerciseName}/{missionName}/{taskName}", ManageFolders.class);
        router.attach("/{storageArea}/{exerciseName}/{missionName}/{taskName}/{roleAssignment}", ManageFolders.class);
        
        return router;
    }
}
