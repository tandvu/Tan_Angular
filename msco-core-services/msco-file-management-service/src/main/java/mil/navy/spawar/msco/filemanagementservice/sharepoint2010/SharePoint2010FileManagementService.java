package mil.navy.spawar.msco.filemanagementservice.sharepoint2010;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerFactory;

import org.apache.commons.codec.binary.Base64OutputStream;
import org.apache.commons.io.IOUtils;
import org.apache.http.entity.ContentType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import mil.navy.spawar.msco.common.HttpUtils;
import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.XmlUtils;
import mil.navy.spawar.msco.common.datamodel.DataProduct;
import mil.navy.spawar.msco.common.datamodel.ErrorLogEntry;
import mil.navy.spawar.msco.common.datamodel.MissionProduct;
import mil.navy.spawar.msco.common.datamodel.MissionProductLogEntry;
import mil.navy.spawar.msco.filemanagementservice.FileManagementService;

public class SharePoint2010FileManagementService extends FileManagementService {

	private SharePoint2010Configuration config;
	private DocumentBuilderFactory docFactory;
	private DocumentBuilder docBuilder;
	private TransformerFactory transFactory;
	private Transformer transformer;
	
	private static final String PROPERTIES_FILE_PATH = "fms-sharepoint2010-config.properties";
	private static final String SHAREPOINT_SERVICE_BASE_PATH = "_vti_bin";
	private static final String SHAREPOINT_SERVICE_LIST_DATA_PATH = "ListData.svc";
	private static final String SHAREPOINT_DOC_LISTS_PATH = "lists.asmx";
	private static final String SHAREPOINT_SERVICE_COPY_PATH = "copy.asmx";
	
	private static final String MS_SHAREPOINT_SOAP_URI = "http://schemas.microsoft.com/sharepoint/soap/";
	private static final String SOAP_ACTION_CREATE_DOC_LIBRARY = "AddList";
	private static final String SOAP_ACTION_UPDATE_LIST_ITEMS = "UpdateListItems";
	private static final String SOAP_ACTION_COPY_DATA_PRODUCT = "CopyIntoItemsLocal";
	private static final String SOAP_ACTION_UPLOAD_DATA_PRODUCT = "CopyIntoItems";
	
	private static final String UPDATE_LIST_ITEMS_SUCCESS_CODE = "0x00000000";
	private static final String COPY_SUCCESS_CODE = "Success";
	
	private static final Logger logger = LoggerFactory.getLogger(SharePoint2010FileManagementService.class);

	private SharePoint2010FileManagementService() {
		config = new SharePoint2010Configuration(PROPERTIES_FILE_PATH);
		logger.debug("Loaded SharePoint2010FileManagementServiceConfig...");
		
		// Initialize the DocumentBuilderFactory
		docFactory = DocumentBuilderFactory.newInstance();
		try {
			docBuilder = docFactory.newDocumentBuilder();
		} catch (ParserConfigurationException e) {
			docBuilder = null;
			logger.error("Error initializing DocumentBuilderFactory", e);
		}

		// Initialize the Transformer
		transFactory = TransformerFactory.newInstance();
		try {
			transformer = transFactory.newTransformer();
			transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
		} catch (TransformerConfigurationException e) {
			logger.error("Error initializing TransformerFactory", e);
			transformer = null;
		}

		// MRT: Try to Create the Document Library on Init
		setDocumentLibrary(config.getDocumentLibrary());
	}

	public SharePoint2010Configuration getConfig() {
		return config;
	}

	@Override
	public List<DataProduct> getDataProductList(String storageArea, String exerciseName, String missionName, 
			String taskName, String roleAssignment)
	{
		String subPath = null;
		
		if((storageArea != null) && (!storageArea.isEmpty()))
		{
			// Build the SubPath for the filter parameter
			subPath = storageArea.trim();
			
			if((exerciseName != null) && (!exerciseName.isEmpty()))
			{
				subPath += "/" + exerciseName.trim();
			
				if((missionName != null) && (!missionName.isEmpty()))
				{
					subPath += "/" + missionName.trim();
					
					if((taskName != null) && (!taskName.isEmpty()))
					{
						subPath += "/" + taskName.trim();
						
						if((roleAssignment != null) && (!roleAssignment.isEmpty()))
						{
							subPath += "/" + roleAssignment.trim();
						}
					}
				}
			}
		}

		return getDataProductList(subPath);
	}
	
	@Override
	public List<DataProduct> getDataProductList(String path)
	{
		List<DataProduct> result = Collections.emptyList();

		if((path != null) && (!path.isEmpty()))
		{
			List<String> pathList = new ArrayList<String>();
			pathList.add(config.getSitePath());
			pathList.add(SHAREPOINT_SERVICE_BASE_PATH);
			pathList.add(SHAREPOINT_SERVICE_LIST_DATA_PATH);
			pathList.add(config.getDocumentLibrary());
			
			String trimmedPath = SharePoint2010FileManagementService.getTrimmedPath(path);
			
			String baseUrl = HttpUtils.getEndpoint(config.getProtocol(), config.getAddress(), config.getPort(), pathList);
			String filterQueryParamater = "?$filter=endswith(Path,'";
			
			try
			{
				filterQueryParamater += URLEncoder.encode(trimmedPath, "utf-8");
			} 
			catch (UnsupportedEncodingException e)
			{
				logger.error("Couldn't URLEncode Query String", e);
			}
			
			filterQueryParamater += "')";
			
			String response = HttpUtils.doHttpGet(baseUrl + filterQueryParamater, config.getUser(), config.getPass());
			result = parseGetListDataResponse(response, trimmedPath);
		}

		return result;
	}
	
	@Override
	public boolean setDocumentLibrary(String newLibraryName)
	{
		boolean result = false;
		
		if((newLibraryName != null) && (!newLibraryName.isEmpty()) && (!newLibraryName.equals(config.getDocumentLibrary())))
		{
			config.setDocumentLibrary(newLibraryName);
			String soapMessage = buildCreateDocumentLibrarySoapMsg(config.getDocumentLibrary());
			
			// Create the soap url string
			List<String> pathList = new ArrayList<String>();
			pathList.add(config.getSitePath());
			pathList.add(SHAREPOINT_SERVICE_BASE_PATH);
			pathList.add(SHAREPOINT_DOC_LISTS_PATH);
			
			String url = HttpUtils.getEndpoint(config.getProtocol(), config.getAddress(), config.getPort(), pathList);
	
			HashMap<String,String> headerHash = new HashMap<String,String>();
			headerHash.put("SOAPAction", MS_SHAREPOINT_SOAP_URI + SOAP_ACTION_CREATE_DOC_LIBRARY);
			
			String response = HttpUtils.doHttpPost(url, soapMessage, ContentType.TEXT_XML, headerHash, config.getUser(), config.getPass());
			result = parseSetDocumentLibraryResponse(response);
		}
		
		return result;
	}
	
	@Override
	// NOTE: Since trying to create an existing folder returns an error, always take the result from the leaf folder response
	public boolean createFolder(String storageArea, String exerciseName, String missionName, String taskName, String roleAssignment)
	{
		boolean result = false;
		String currentPath = null;
		
		// MRT - Need to create the folders individually in SharePoint as we go down the path
		if((storageArea != null) && (!storageArea.isEmpty()))
		{
			String trimmedStorageArea = storageArea.trim();
			String response = createSingleFolder(currentPath, trimmedStorageArea);
			result = parseUpdateListItemsResponse(response);
			
			if((exerciseName != null) && (!exerciseName.isEmpty()))
			{
				String trimmedExerciseName = exerciseName.trim();
				
				currentPath = trimmedStorageArea;
				response = createSingleFolder(currentPath, trimmedExerciseName);
				result = parseUpdateListItemsResponse(response);
				
				if((missionName != null) && (!missionName.isEmpty()))
				{
					String trimmedMissionName = missionName.trim();
					
					currentPath += "/" + trimmedExerciseName;
					response = createSingleFolder(currentPath, trimmedMissionName);
					result = parseUpdateListItemsResponse(response);
					
					if((taskName != null) && (!taskName.isEmpty()))
					{
						String trimmedTaskName = taskName.trim();
						
						currentPath += "/" + trimmedMissionName;
						response = createSingleFolder(currentPath, trimmedTaskName);
						result = parseUpdateListItemsResponse(response);
						
						if((roleAssignment != null) && (!roleAssignment.isEmpty()))
						{
							String trimmedRoleAssignment = roleAssignment.trim();
							
							currentPath += "/" + trimmedTaskName;
							response = createSingleFolder(currentPath, trimmedRoleAssignment);
							result = parseUpdateListItemsResponse(response);
						}
					}
				}
			}
		}
		
		return result;
	}
	
	// TODO: Check if folder exists before trying to create it
	private String createSingleFolder(String path, String folderName)
	{
		String trimmedPath = SharePoint2010FileManagementService.getTrimmedPath(path);
		String trimmedFolderName = folderName.trim();
		
		String soapMessage = buildCreateFolderSoapMsg(trimmedPath, trimmedFolderName);
		
		// Create the soap url string
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getSitePath());
		pathList.add(SHAREPOINT_SERVICE_BASE_PATH);
		pathList.add(SHAREPOINT_DOC_LISTS_PATH);
		String url = HttpUtils.getEndpoint(config.getProtocol(), config.getAddress(), config.getPort(), pathList);

		HashMap<String,String> headerHash = new HashMap<String,String>();
		headerHash.put("SOAPAction", MS_SHAREPOINT_SOAP_URI + SOAP_ACTION_UPDATE_LIST_ITEMS);
		
		return HttpUtils.doHttpPost(url, soapMessage, ContentType.TEXT_XML, headerHash, config.getUser(), config.getPass());
	}
	
	// *Path is of the form /{Execution|Planning}/Exercise/Mission/{Task}/{Role}
	// TODO: Handle copying between document libraries?
	@Override
	public MissionProduct copyDataProduct(String sourceName, String sourcePath, String destName, String destPath)
	{
		String trimmedSourceName = sourceName.trim();
		String trimmedDestName = destName.trim();
		
		String trimmedSourcePath = SharePoint2010FileManagementService.getTrimmedPath(sourcePath);
		String trimmedDestPath = SharePoint2010FileManagementService.getTrimmedPath(destPath);
		
		createContainingFolder(trimmedDestPath);
		
		//Prepend the Source/Destination with SharePoint Server URL
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getSitePath());
		pathList.add(config.getDocumentLibrary());
		pathList.add(trimmedSourcePath);
		pathList.add(trimmedSourceName);
		String sourceEndpoint = HttpUtils.getEndpoint(config.getProtocol(), config.getAddress(), config.getPort(), pathList);
		
		pathList.clear();
		pathList.add(config.getSitePath());
		pathList.add(config.getDocumentLibrary());
		pathList.add(trimmedDestPath);
		pathList.add(trimmedDestName);
		String destEndpoint = HttpUtils.getEndpoint(config.getProtocol(), config.getAddress(), config.getPort(), pathList);
		
		String soapMessage = buildCopyDocumentSoapMsg(sourceEndpoint, destEndpoint);
		
		pathList.clear();
		pathList.add(SHAREPOINT_SERVICE_BASE_PATH);
		pathList.add(SHAREPOINT_SERVICE_COPY_PATH);
		String url = HttpUtils.getEndpoint(config.getProtocol(), config.getAddress(), config.getPort(), pathList);
		
		HashMap<String,String> headerHash = new HashMap<String,String>();
		headerHash.put("SOAPAction", MS_SHAREPOINT_SOAP_URI + SOAP_ACTION_COPY_DATA_PRODUCT);
		
		String response = HttpUtils.doHttpPost(url, soapMessage, ContentType.TEXT_XML, headerHash, config.getUser(), config.getPass());
		boolean result = parseCopyIntoResponse(response, true);
		
		// Log the copy if successful
		if(result)
		{
			postMissionProductLogEntry(trimmedDestPath, trimmedDestName, destEndpoint);
			
			//Build the response
			MissionProduct missionProduct  = new MissionProduct();
			missionProduct.setFilename(trimmedDestName);
			missionProduct.setName(trimmedDestName);
			missionProduct.setPath(trimmedDestPath);
			missionProduct.setUrl(destEndpoint);
			
			return missionProduct;
		}
		else
		{
			return null;
		}
	}
	
	// destinationPath is of the form /{Execution|Planning}/Exercise/Mission/{Task}/{Role}
	@Override
	public MissionProduct uploadDataProduct(String filename, String destinationPath, InputStream inputStream)
	{
		String trimmedFilename = filename.trim();
		String trimmedPath = SharePoint2010FileManagementService.getTrimmedPath(destinationPath);
		createContainingFolder(trimmedPath);
		
		//Prepend the Destination with SharePoint Server URL, <host>/<siteName>/<library>
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getSitePath());
		pathList.add(config.getDocumentLibrary());
		pathList.add(trimmedPath);
		pathList.add(trimmedFilename);
		String destinationEndpoint = HttpUtils.getEndpoint(config.getProtocol(), config.getAddress(), config.getPort(), pathList);
		
		String soapMessage = buildUploadDocumentSoapMsg(trimmedFilename, destinationEndpoint, inputStream);
		
		pathList.clear();
		pathList.add(SHAREPOINT_SERVICE_BASE_PATH);
		pathList.add(SHAREPOINT_SERVICE_COPY_PATH);
		String url = HttpUtils.getEndpoint(config.getProtocol(), config.getAddress(), config.getPort(), pathList);
		
		HashMap<String,String> headerHash = new HashMap<String,String>();
		headerHash.put("SOAPAction", MS_SHAREPOINT_SOAP_URI + SOAP_ACTION_UPLOAD_DATA_PRODUCT);
		
		String result = HttpUtils.doHttpPost(url, soapMessage, ContentType.TEXT_XML, headerHash, config.getUser(), config.getPass());
		
		// Log the upload if successful
		boolean uploadResult = parseCopyIntoResponse(result, false);
		
		if(uploadResult)
		{
			postMissionProductLogEntry(trimmedPath, trimmedFilename, destinationEndpoint);

			//Build the response
			MissionProduct missionProduct  = new MissionProduct();
			missionProduct.setFilename(trimmedFilename);
			missionProduct.setName(trimmedFilename);
			missionProduct.setPath(trimmedPath);
			missionProduct.setUrl(destinationEndpoint);
			
			return missionProduct;
		}
		else
		{
			return null;
		}
	}
	
	// path is of the form /{Execution|Planning}/Exercise/Mission/{Task}/{Role}
	@Override
	public boolean deleteDataProduct(String filename, String path)
	{
		String trimmedFilename = filename.trim();
		String trimmedPath = SharePoint2010FileManagementService.getTrimmedPath(path);
		
		DataProduct productToDelete = null;
		boolean result = false;
		
		// Get the Data Product Info from SharePoint. We'll need the URL and ID for Delete to work
		if(trimmedFilename != null && trimmedPath != null)
		{
			List<DataProduct> products = FileManagementService.getInstance().getDataProductList(trimmedPath);
			
			for(DataProduct product : products)
			{
				if(product.getName().equals(trimmedFilename))
				{
					productToDelete = product;
					break;
				}
			}
		}
		
		if(productToDelete != null)
		{
			String soapMessage = buildDeleteDocumentSoapMsg(productToDelete);
			
			List<String> pathList = new ArrayList<String>();
			pathList.add(config.getSitePath());
			pathList.add(SHAREPOINT_SERVICE_BASE_PATH);
			pathList.add(SHAREPOINT_DOC_LISTS_PATH);
			String url = HttpUtils.getEndpoint(config.getProtocol(), config.getAddress(), config.getPort(), pathList);
			
			HashMap<String,String> headerHash = new HashMap<String,String>();
			headerHash.put("SOAPAction", MS_SHAREPOINT_SOAP_URI + SOAP_ACTION_UPDATE_LIST_ITEMS);
			
			String deleteResponse = HttpUtils.doHttpPost(url, soapMessage, ContentType.TEXT_XML, headerHash, 
					config.getUser(), config.getPass());
			
			// Delete and Create Folder have the same response format
			result = parseUpdateListItemsResponse(deleteResponse);
		}
		
		return result;
	}
	
	// path is of the form /{Execution|Planning}/Exercise/Mission/{Task}/{Role}
	private boolean createContainingFolder(String path)
	{
		boolean result = false;
		
		if (path != null)
		{
			// Strip off any trailing or leading slashes
			if(path.startsWith("/"))
			{	
				path = path.substring(1);
			}
			
			if(path.endsWith("/"))
			{	
				path = path.substring(0, path.length()-1);
			}
			
			String[] pathList = path.split("/");
			String storageArea  = null;
			String exerciseName = null;
			String missionName = null;
			String taskName = null;
			String roleAssignment = null;
			
			if(pathList.length > 0)
			{
				storageArea = pathList[0].trim();
				
				if(pathList.length > 1)
				{
					exerciseName =  pathList[1].trim();
					
					if(pathList.length > 2)
					{
						missionName = pathList[2].trim();
						
						if(pathList.length > 3)
						{
							taskName =  pathList[3].trim();
							
							if(pathList.length > 4)
							{
								roleAssignment =  pathList[4].trim();
							}
						}
					}
				}
				
				result = createFolder(storageArea, exerciseName, missionName, taskName, roleAssignment);
			}	
		}	
		
		return result;
	}

	/////////////////////////////////// SOAP MESSAGES //////////////////////////////////////////////////////////////
	public String buildCreateDocumentLibrarySoapMsg(String libraryName)
	{
		Document doc = XmlUtils.buildSoapEnvelope(docBuilder);
		Element soapBody = XmlUtils.getSoapBodyElement(doc);
		
		if(doc != null && soapBody != null)
		{
			//Add List Command
			Element addList = doc.createElement(SOAP_ACTION_CREATE_DOC_LIBRARY);
			Attr currentAttr = doc.createAttribute("xmlns");
			currentAttr.setValue(MS_SHAREPOINT_SOAP_URI);
			addList.setAttributeNode(currentAttr);
			
			soapBody.appendChild(addList);
	
			//List Name
			Element listName = doc.createElement("listName");
			listName.setTextContent(libraryName);
			
			//Description
			Element description = doc.createElement("description");
			description.setTextContent("none");
			
			//Description
			Element templateId = doc.createElement("templateID");
			templateId.setTextContent("101");
			
			addList.appendChild(listName);
			addList.appendChild(description);
			addList.appendChild(templateId);
		}
		
		return XmlUtils.domToString(doc, transformer);
	}

	protected String buildCreateFolderSoapMsg(String path, String folderName)
	{
		Document doc = XmlUtils.buildSoapEnvelope(docBuilder);
		Element soapBody = XmlUtils.getSoapBodyElement(doc);
		
		if(doc != null && soapBody != null)
		{
			//Add List Command
			Element updateListItemsElement = doc.createElement(SOAP_ACTION_UPDATE_LIST_ITEMS);
			Attr currentAttr = doc.createAttribute("xmlns");
			currentAttr.setValue(MS_SHAREPOINT_SOAP_URI);
			updateListItemsElement.setAttributeNode(currentAttr);
			
			soapBody.appendChild(updateListItemsElement);
	
			//List Name
			Element listName = doc.createElement("listName");
			listName.setTextContent(config.getDocumentLibrary());
			
			updateListItemsElement.appendChild(listName);
			
			//Updates
			Element updates = doc.createElement("updates");
			updateListItemsElement.appendChild(updates);
			
			//Batch
			Element batch = doc.createElement("Batch");
			
			currentAttr = doc.createAttribute("OnError");
			currentAttr.setValue("Continue");
			batch.setAttributeNode(currentAttr);
			
			currentAttr = doc.createAttribute("RootFolder");
			
			List<String> pathList = new ArrayList<String>();
			pathList.add(config.getSitePath());
			pathList.add(config.getDocumentLibrary());
			
			if(path != null && !path.isEmpty())
			{
				pathList.add(path);
			}
			
			currentAttr.setValue(HttpUtils.getEndpoint(config.getProtocol(), config.getAddress(), config.getPort(), pathList));
			batch.setAttributeNode(currentAttr);
			
			updates.appendChild(batch);
			
			//Method
			Element method = doc.createElement("Method");
			
			currentAttr = doc.createAttribute("ID");
			currentAttr.setValue("1");
			method.setAttributeNode(currentAttr);
			
			currentAttr = doc.createAttribute("Cmd");
			currentAttr.setValue("New");
			method.setAttributeNode(currentAttr);
			
			batch.appendChild(method);
			
			//FSObjType
			Element fSobjTypeField = doc.createElement("Field");
			
			currentAttr = doc.createAttribute("Name");
			currentAttr.setValue("FSObjType");
			fSobjTypeField.setAttributeNode(currentAttr);
			
			fSobjTypeField.setTextContent("1");
			method.appendChild(fSobjTypeField);
			
			//BaseName
			Element baseNameField = doc.createElement("Field");
			
			currentAttr = doc.createAttribute("Name");
			currentAttr.setValue("BaseName");
			baseNameField.setAttributeNode(currentAttr);
			
			baseNameField.setTextContent(folderName);
			method.appendChild(baseNameField);
			
			//ID
			Element idField = doc.createElement("Field");
			
			currentAttr = doc.createAttribute("Name");
			currentAttr.setValue("ID");
			idField.setAttributeNode(currentAttr);
			
			idField.setTextContent("New");
			method.appendChild(idField);
		}
		
		return XmlUtils.domToString(doc, transformer);
	}
	
	public String buildCopyDocumentSoapMsg(String source, String destination)
	{
		Document doc = XmlUtils.buildSoapEnvelope(docBuilder);
		Element soapBody = XmlUtils.getSoapBodyElement(doc);
		
		if(doc != null && soapBody != null)
		{
			//Add List Command
			Element coptIntoLocal = doc.createElement(SOAP_ACTION_COPY_DATA_PRODUCT);
			Attr currentAttr = doc.createAttribute("xmlns");
			currentAttr.setValue(MS_SHAREPOINT_SOAP_URI);
			coptIntoLocal.setAttributeNode(currentAttr);
			
			soapBody.appendChild(coptIntoLocal);
	
			//Source Url
			Element sourceElement = doc.createElement("SourceUrl");
			sourceElement.setTextContent(source);
			coptIntoLocal.appendChild(sourceElement);
			
			//Destination URL
			Element destElement = doc.createElement("DestinationUrls");
			Element destElementString = doc.createElement("string");
			destElementString.setTextContent(destination);
			destElement.appendChild(destElementString);
			coptIntoLocal.appendChild(destElement);
		}
		
		return XmlUtils.domToString(doc, transformer);
	}

	public String buildUploadDocumentSoapMsg(String source, String destination, InputStream inputStream) {
		Document doc = XmlUtils.buildSoapEnvelope(docBuilder);
		Element soapBody = XmlUtils.getSoapBodyElement(doc);
		
		if (doc != null && soapBody != null) {
			// Add List Command
			Element coptIntoItems = doc.createElement(SOAP_ACTION_UPLOAD_DATA_PRODUCT);
			Attr currentAttr = doc.createAttribute("xmlns");
			currentAttr.setValue(MS_SHAREPOINT_SOAP_URI);
			coptIntoItems.setAttributeNode(currentAttr);

			soapBody.appendChild(coptIntoItems);

			// Source Url
			Element sourceElement = doc.createElement("SourceUrl");
			sourceElement.setTextContent(source); 					// SourceUrl == SourceFileName
			coptIntoItems.appendChild(sourceElement);

			// Destination URL
			Element destElement = doc.createElement("DestinationUrls");
			Element destElementString = doc.createElement("string");
			destElementString.setTextContent(destination);
			destElement.appendChild(destElementString);
			coptIntoItems.appendChild(destElement);

			// Fields
			Element fields = doc.createElement("Fields");
			Element titleField = doc.createElement("FieldInformation");

			currentAttr = doc.createAttribute("Type");
			currentAttr.setValue("Text");
			titleField.setAttributeNode(currentAttr);

			currentAttr = doc.createAttribute("DisplayName");
			currentAttr.setValue(source);
			titleField.setAttributeNode(currentAttr);

			currentAttr = doc.createAttribute("InternalName");
			currentAttr.setValue(source);
			titleField.setAttributeNode(currentAttr);

			currentAttr = doc.createAttribute("Value");
			currentAttr.setValue("Value" + source);
			titleField.setAttributeNode(currentAttr);
			fields.appendChild(titleField);
			coptIntoItems.appendChild(fields);

			// Stream
			Element stream = doc.createElement("Stream");
			
			try {
				ByteArrayOutputStream byteaOutput = new ByteArrayOutputStream();
				Base64OutputStream base64Output = new Base64OutputStream(byteaOutput);
				IOUtils.copy(inputStream, base64Output);
				
				base64Output.flush();
				base64Output.close();
				
				stream.setTextContent(byteaOutput.toString());
				coptIntoItems.appendChild(stream);
			} catch (IOException e) {
				logger.error("IO Exception reading File Upload Stream", e);
			}
		}

		return XmlUtils.domToString(doc, transformer);
	}
	
	protected String buildDeleteDocumentSoapMsg(DataProduct product)
	{
		Document doc = XmlUtils.buildSoapEnvelope(docBuilder);
		Element soapBody = XmlUtils.getSoapBodyElement(doc);
		
		if(doc != null && soapBody != null)
		{
			//Add List Command
			Element updateListItemsElement = doc.createElement(SOAP_ACTION_UPDATE_LIST_ITEMS);
			Attr currentAttr = doc.createAttribute("xmlns");
			currentAttr.setValue(MS_SHAREPOINT_SOAP_URI);
			updateListItemsElement.setAttributeNode(currentAttr);
			
			soapBody.appendChild(updateListItemsElement);
	
			//List Name
			Element listName = doc.createElement("listName");
			listName.setTextContent(config.getDocumentLibrary());
			
			updateListItemsElement.appendChild(listName);
			
			//Updates
			Element updates = doc.createElement("updates");
			updateListItemsElement.appendChild(updates);
			
			//Batch
			Element batch = doc.createElement("Batch");
			
			currentAttr = doc.createAttribute("OnError");
			currentAttr.setValue("Continue");
			batch.setAttributeNode(currentAttr);
			
			updates.appendChild(batch);
			
			//Method
			Element method = doc.createElement("Method");
			
			currentAttr = doc.createAttribute("ID");
			currentAttr.setValue("1");
			method.setAttributeNode(currentAttr);
			
			currentAttr = doc.createAttribute("Cmd");
			currentAttr.setValue("Delete");
			method.setAttributeNode(currentAttr);
			
			batch.appendChild(method);
			
			//ID
			Element idField = doc.createElement("Field");
			
			currentAttr = doc.createAttribute("Name");
			currentAttr.setValue("ID");
			idField.setAttributeNode(currentAttr);
			
			idField.setTextContent(product.getId());
			method.appendChild(idField);
			
			//FileRef
			Element fileRefField = doc.createElement("Field");
			
			currentAttr = doc.createAttribute("Name");
			currentAttr.setValue("FileRef");
			fileRefField.setAttributeNode(currentAttr);
			
			fileRefField.setTextContent(product.getUrl());
			method.appendChild(fileRefField);
		}
		
		return XmlUtils.domToString(doc, transformer);
	}
	
	////////////////////// RESPONSE PARSING METHODS /////////////////////////////////////////
	// ATOM FEED WITH COLLECTION OF "entry" TAGS FOR EACH DOC.
	private List<DataProduct> parseGetListDataResponse(String response, String queryPath)
	{
		List<DataProduct> result = Collections.emptyList();
		
		if(response != null && !response.isEmpty())
		{
			try {
				Document document = docBuilder.parse(IOUtils.toInputStream(response, "UTF-8"));
				NodeList entryNodeList = document.getElementsByTagName("entry");
				
				if(entryNodeList != null && entryNodeList.getLength() > 0)
				{
					result = new ArrayList<DataProduct>();
					DataProduct currentProduct = null;
					Element currentElement = null;
					
					for(int i=0; i < entryNodeList.getLength(); i++)
					{
						if(entryNodeList.item(i) instanceof Element)
						{
							currentElement = (Element)entryNodeList.item(i);
							currentProduct = new DataProduct();
							
							if(!queryPath.startsWith("/"))
							{
								currentProduct.setPath("/" + queryPath);
							}
							else
							{
								currentProduct.setPath(queryPath);
							}
							
							//GET LAST UPDATED TIME
							Element lastUpdateTime = XmlUtils.getFirstElementByTagName(currentElement, "updated");
							
							if(lastUpdateTime != null)
							{
								currentProduct.setLastModificationTime(lastUpdateTime.getTextContent());
							}
							
							//GET THE CONTENT SOURCE LOCATION
							Element contentSourceLocation = XmlUtils.getFirstElementByTagName(currentElement, "content");
							
							if(contentSourceLocation != null)
							{
								// NOTE: 'src' is URLEncoded. We'll need it unencoded later when we ask for a file by "fileRef"
								currentProduct.setUrl(URLDecoder.decode(contentSourceLocation.getAttribute("src"), "utf-8"));
							}
							
							//GET THE PROPERTIES
							Element properties = XmlUtils.getFirstElementByTagName(currentElement, "m:properties");
							
							if(properties != null)
							{
								// GET THE NAME
								Element name = XmlUtils.getFirstElementByTagName(currentElement, "d:Name");
								
								if(name != null)
								{
									currentProduct.setName(name.getTextContent());
								}
									
								// GET THE ID
								Element id = XmlUtils.getFirstElementByTagName(currentElement, "d:Id");
								
								if(id != null)
								{
									currentProduct.setId(id.getTextContent());
								}	
								
//								// GET THE PATH
//								Element path = XmlUtils.getFirstElementByTagName(currentElement, "d:Path");
//								
//								if(path != null)
//								{
//									currentProduct.setPath(path.getTextContent());
//								}	
								
								// GET THE CONTENT TYPE
								Element contentType = XmlUtils.getFirstElementByTagName(currentElement, "d:ContentType");
								
								if(contentType != null)
								{
									currentProduct.setContentType(contentType.getTextContent());
								}	
							}
							
						}
						
						// ONLY ADD IN FILES FOR NOW, SKIP FOLDERS
						if(currentProduct.getContentType() != null && currentProduct.getContentType().equalsIgnoreCase("Document"))
						{
							result.add(currentProduct);
						}
					}
				}
				
			} catch (SAXException e) {
				logger.error("Error parsing XML Response", e);
			} catch (IOException e) {
				logger.error("IO Error parsing XML Response", e);
			}
		}
		
		return result;
	}
	
	// Parse the ListUpdateResponse
	private boolean parseUpdateListItemsResponse(String response)
	{
		boolean result = false;
		
		if(response != null && !response.isEmpty())
		{
			try {
				Document document = docBuilder.parse(IOUtils.toInputStream(response, "UTF-8"));
				Element soapBody = XmlUtils.getSoapBodyElement(document);
				
				if(soapBody != null)
				{
					Element updateListItemsResponse = XmlUtils.getFirstElementByTagName(soapBody, "UpdateListItemsResponse");
					
					if(updateListItemsResponse != null)
					{
						Element updateListItemsResult = XmlUtils.getFirstElementByTagName(updateListItemsResponse, "UpdateListItemsResult");
						
						if(updateListItemsResult != null)
						{
							Element results = XmlUtils.getFirstElementByTagName(updateListItemsResult, "Results");
							
							if(results != null)
							{
								Element resultElement = XmlUtils.getFirstElementByTagName(results, "Result");
								
								if(resultElement != null)
								{
									Element errorCode = XmlUtils.getFirstElementByTagName(resultElement, "ErrorCode");
									
									if(errorCode != null && errorCode.getTextContent().equalsIgnoreCase(UPDATE_LIST_ITEMS_SUCCESS_CODE))
									{
										result = true;
									}
								}
							}
						}
					}
				}
			} catch (SAXException e) {
				logger.error("Error parsing XML Response", e);
			} catch (IOException e) {
				logger.error("IO Error parsing XML Response", e);
			}
		}
		
		return result;
	}
	
	// Parse the ListUpdateResponse
	private boolean parseCopyIntoResponse(String response, boolean isLocal)
	{
		boolean result = false;
		
		if(response != null && !response.isEmpty())
		{
			try {
				Document document = docBuilder.parse(IOUtils.toInputStream(response, "UTF-8"));
				Element soapBody = XmlUtils.getSoapBodyElement(document);
				
				if(soapBody != null)
				{
					Element copyIntoItemsResponse = null;
					
					if(isLocal)
					{
						copyIntoItemsResponse = XmlUtils.getFirstElementByTagName(soapBody, "CopyIntoItemsLocalResponse");
					}
					else
					{
						copyIntoItemsResponse = XmlUtils.getFirstElementByTagName(soapBody, "CopyIntoItemsResponse");
					}
					
					if(copyIntoItemsResponse != null)
					{
						Element results = XmlUtils.getFirstElementByTagName(copyIntoItemsResponse, "Results");
							
						if(results != null)
						{
							Element resultElement = XmlUtils.getFirstElementByTagName(results, "CopyResult");						
							String errorCode = resultElement.getAttribute("ErrorCode");
							
							if(errorCode != null && errorCode.equalsIgnoreCase(COPY_SUCCESS_CODE))
							{
								result = true;
							}
						}
					}
				}
			} catch (SAXException e) {
				logger.error("Error parsing XML Response", e);
			} catch (IOException e) {
				logger.error("IO Error parsing XML Response", e);
			}
		}
		
		return result;
	}
	
	// MRT - Can't parse, APAN Site always returns an HTML error response even when command is successful
	private boolean parseSetDocumentLibraryResponse(String response)
	{
		return true;
	}
	
	// LOGGING
	@Override
	public String postMissionProductLogEntry(String productPath, String productName, String url)
	{
		String result = "";
		
		if(productPath != null)
		{
			MissionProductLogEntry entry = new MissionProductLogEntry();
			
			// Strip off any leading or trailing slashes
			if(productPath.startsWith("/"))
			{	
				productPath = productPath.substring(1);
			}
			
			if(productPath.endsWith("/"))
			{	
				productPath = productPath.substring(0, productPath.length()-1);
			}
			
			String[] fields = productPath.split("/");
			
			entry.setMissionName(fields[2].trim());
			
			//Get task if we have it
			if(fields.length > 3)
			{
				entry.setTaskName(fields[3].trim());
			}
			
			entry.setProcessInstanceId("unknown");
			entry.setInstanceTaskId("unknown");
			entry.setPrevTaskIds(Collections.<String>emptyList());
			
			entry.setProductName(productName);
			entry.setProductDescription(productName);
			entry.setPath(productPath);
			entry.setFileSizeBytes("0");
			entry.setUser("unknown");
			entry.setTime((new Date()).toString());
			entry.setUrl(url);
			
			String exerciseName = fields[1].trim();
			
			// Need to URL Encode the path/names
			try
			{
				exerciseName = URLEncoder.encode(exerciseName, "utf-8");
			} 
			catch (UnsupportedEncodingException e)
			{
				logger.error("Couldn't URLEncode Query String", e);
			}
			
			List<String> pathList = new ArrayList<String>();
			pathList.add(config.getEcsServiceUri());
			pathList.add(config.getEcsServiceMissionProductLoggingEndpoint());
			pathList.add(exerciseName);											// Exercise Name
			
			String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
					config.getEcsServicePort(), pathList);
			
			result = HttpUtils.doHttpPostJson(baseUrl, JsonUtils.toJsonString(entry));
		}
		
		return result;
	}
	
	public static String getTrimmedPath(String path)
	{
		String result = "";
		
		if(path != null)
		{
			// Strip off any trailing or leading slashes
			// TODO: Handle multiple slashes
			if(path.startsWith("/"))
			{	
				path = path.substring(1);
			}
			
			if(path.endsWith("/"))
			{	
				path = path.substring(0, path.length()-1);
			}
						
			String[] pathList = path.split("/");
			
			if(pathList != null)
			{
				for(int i=0; i < pathList.length; i++)
				{
					result +=  "/" + pathList[i].trim();
				}
			}
		}
		
		return result;
	}
	
	@Override
	public String postErrorLogEntry(String level, String message, String exerciseName)
	{	
		ErrorLogEntry entry = new ErrorLogEntry();
		entry.setLevel(level);
		entry.setMessage(message);
		
		String encodedExerciseName = exerciseName;
		
		// Need to URL Encode the path/names
		try
		{
			encodedExerciseName = URLEncoder.encode(encodedExerciseName, "utf-8");
		} 
		catch (UnsupportedEncodingException e)
		{
			logger.error("Couldn't URLEncode Query String", e);
		}
		
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getEcsServiceErrorLoggingEndpoint());
		pathList.add(encodedExerciseName);
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		return HttpUtils.doHttpPostJson(baseUrl, JsonUtils.toJsonString(entry));
	}
}
