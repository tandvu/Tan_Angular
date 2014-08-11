package mil.navy.spawar.msco.filemanagementservice;

import java.io.InputStream;
import java.util.List;

import mil.navy.spawar.msco.common.datamodel.DataProduct;
import mil.navy.spawar.msco.common.datamodel.MissionProduct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public abstract class FileManagementService
{
	private static final Logger logger = LoggerFactory.getLogger(FileManagementService.class);
	private static FileManagementService fileManagementService = null;

	/**
	 * Gives access to the one and only FileManagementService instance. Impl
	 * type is specified in Spring "config.xml".
	 * 
	 * @return the one and only FileManagementService instance
	 */
	// TODO: MAKE SINGLETON unsynchronized
	public static final synchronized FileManagementService getInstance()
	{
		if (fileManagementService == null)
		{
			ApplicationContext context = null;

			// Get the Implementation Class from the Spring XML File
			try
			{
				context = new ClassPathXmlApplicationContext(new String[] { "config.xml" });
				fileManagementService = (FileManagementService) context.getBean("fileManagementService");
			} catch (BeansException e)
			{
				fileManagementService = null;
				logger.error("Error reading Spring config for FileManagementService", e);
			}
		}

		return fileManagementService;
	}

	public abstract List<DataProduct> getDataProductList(String storageArea, String exerciseName, String missionName, 
			String taskName, String roleAssignment);
	
	public abstract List<DataProduct> getDataProductList(String path);
	
	public abstract boolean createFolder(String storageArea, String exerciseName, String missionName, String taskName, 
			String roleAssignment);
	
	public abstract boolean setDocumentLibrary(String libraryName);
	public abstract MissionProduct copyDataProduct(String sourceName, String sourcePath, String destName, String destPath);
	public abstract MissionProduct uploadDataProduct(String fileName, String destinationPath, InputStream inputStream);
	public abstract boolean deleteDataProduct(String fileName, String path);
	
	public abstract String postMissionProductLogEntry(String productPath, String productName, String url);
	public abstract String postErrorLogEntry(String level, String message, String exerciseName);
}
