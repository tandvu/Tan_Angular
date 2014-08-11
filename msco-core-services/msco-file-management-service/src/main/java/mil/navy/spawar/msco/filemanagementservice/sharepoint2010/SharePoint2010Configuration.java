package mil.navy.spawar.msco.filemanagementservice.sharepoint2010;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SharePoint2010Configuration {
			
	private static final Logger logger = LoggerFactory.getLogger(SharePoint2010Configuration.class);
	
	private String user;
	private String pass;
	private String protocol;
	private String address;
	private String port;
	private String documentLibrary;
	private String sitePath;
	
	private String ecsServiceProto;
	private String ecsServiceAddr;
	private String ecsServiceUri;
	private String ecsServicePort;
	
	private String ecsServiceMissionProductLoggingEndpoint; 
	private String ecsServiceErrorLoggingEndpoint; 
	
	public SharePoint2010Configuration(String propertiesFilePath)
	{
		Properties prop = new Properties();
		InputStream input = null;
		
		try 
		{
			URL propertiesUrl =	getClass().getClassLoader().getResource(propertiesFilePath);
			
			input = propertiesUrl.openStream();
			prop.load(input);
			
			logger.debug("Reading the SharePoint 2010 config file '" + propertiesUrl.getPath() + "'");

			user = prop.getProperty("fms.sharepoint2010.user");
			pass = prop.getProperty("fms.sharepoint2010.pass");
			protocol = prop.getProperty("fms.sharepoint2010.proto");
			address = prop.getProperty("fms.sharepoint2010.addr");
			port = prop.getProperty("fms.sharepoint2010.port");
			documentLibrary = prop.getProperty("fms.sharepoint2010.documentLibrary");
			sitePath = prop.getProperty("fms.sharepoint2010.sitePath");
			
			ecsServiceProto = prop.getProperty("fms.ecsService.proto");
			ecsServiceAddr = prop.getProperty("fms.ecsService.addr");
			ecsServiceUri = prop.getProperty("fms.ecsService.uri");
			ecsServicePort = prop.getProperty("fms.ecsService.port");
			
			ecsServiceMissionProductLoggingEndpoint = prop.getProperty("fms.ecsService.missionProductLoggingEndpoint");
			ecsServiceErrorLoggingEndpoint = prop.getProperty("fms.ecsService.errorLoggingEndpoint");
			
		} catch (IOException ex) {
			logger.error("IO Error reading SharePoint 2010 config file", ex);
		} catch (NumberFormatException nfe) {
			logger.error("Error parsing number value from SharePoint 2010 config file", nfe);
		}
		finally {
			if (input != null) {
				try {
					input.close();
				} catch (IOException e) {
					logger.error("IO Error Closing SharePoint 2010 config file", e);
				}
			}
		}
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getPass() {
		return pass;
	}

	public void setPass(String pass) {
		this.pass = pass;
	}

	public String getProtocol() {
		return protocol;
	}

	public void setProtocol(String protocol) {
		this.protocol = protocol;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getPort() {
		return port;
	}

	public void setPort(String port) {
		this.port = port;
	}

	public String getDocumentLibrary() {
		return documentLibrary;
	}
	
	public void setDocumentLibrary(String documentLibrary) {
		this.documentLibrary = documentLibrary;
	}

	public String getSitePath() {
		return sitePath;
	}

	public void setSitePath(String sitePath) {
		this.sitePath = sitePath;
	}

	public String getEcsServiceProto()
	{
		return ecsServiceProto;
	}

	public void setEcsServiceProto(String ecsServiceProto)
	{
		this.ecsServiceProto = ecsServiceProto;
	}

	public String getEcsServiceAddr()
	{
		return ecsServiceAddr;
	}

	public void setEcsServiceAddr(String ecsServiceAddr)
	{
		this.ecsServiceAddr = ecsServiceAddr;
	}

	public String getEcsServiceUri()
	{
		return ecsServiceUri;
	}

	public void setEcsServiceUri(String ecsServiceUri)
	{
		this.ecsServiceUri = ecsServiceUri;
	}

	public String getEcsServicePort()
	{
		return ecsServicePort;
	}

	public void setEcsServicePort(String ecsServicePort)
	{
		this.ecsServicePort = ecsServicePort;
	}

	public String getEcsServiceMissionProductLoggingEndpoint()
	{
		return ecsServiceMissionProductLoggingEndpoint;
	}

	public void setEcsServiceMissionProductLoggingEndpoint(String ecsServiceMissionProductLoggingEndpoint)
	{
		this.ecsServiceMissionProductLoggingEndpoint = ecsServiceMissionProductLoggingEndpoint;
	}

	public String getEcsServiceErrorLoggingEndpoint()
	{
		return ecsServiceErrorLoggingEndpoint;
	}

	public void setEcsServiceErrorLoggingEndpoint(String ecsServiceErrorLoggingEndpoint)
	{
		this.ecsServiceErrorLoggingEndpoint = ecsServiceErrorLoggingEndpoint;
	}

	@Override
	public String toString()
	{
		return "SharePoint2010Configuration [user=" + user + ", pass=" + pass + ", protocol=" + protocol + ", address=" + address + ", port=" + port
				+ ", documentLibrary=" + documentLibrary + ", sitePath=" + sitePath + ", ecsServiceProto=" + ecsServiceProto + ", ecsServiceAddr="
				+ ecsServiceAddr + ", ecsServiceUri=" + ecsServiceUri + ", ecsServicePort=" + ecsServicePort + ", ecsServiceMissionProductLoggingEndpoint="
				+ ecsServiceMissionProductLoggingEndpoint + ", ecsServiceErrorLoggingEndpoint=" + ecsServiceErrorLoggingEndpoint + "]";
	}
}

