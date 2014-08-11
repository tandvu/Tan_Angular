package mil.navy.spawar.msco.filemanagementservice.sharepoint2010;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SharePoint2010FileManagementServiceTest {
	
	public static String UPLOAD_TEST_SOAP = 
			"<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" "
			+ "xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\"> <soap:Body><CopyIntoItems "
			+ "xmlns=\"http://schemas.microsoft.com/sharepoint/soap/\"><SourceUrl>testUp2.txt</SourceUrl>"
			+ "<DestinationUrls><string>https://wss.apan.org/s/jtea/testLib1/testExercise3/testMission1/testTask333/testUp2.txt</string>"
			+ "</DestinationUrls><Fields><FieldInformation Type=\"Text\" DisplayName=\"Title\" InternalName=\"Title\" "
			+ "Id=\"{fa564e0f-0c70-4ab9-b863-0177e6ddd247}\" Value=\"Test_Value\" />"
			+ "</Fields><Stream>base64Binary</Stream></CopyIntoItems></soap:Body></soap:Envelope>";
	
	private static final Logger logger = LoggerFactory.getLogger(SharePoint2010FileManagementServiceTest.class);

	// FROM UPLOAD FILE:
	//String source = "testUp5.txt";															  // Source is source FILE_NAME
	//String destination = "s/jtea/testLib1/testExercise3/testMission1/testTask333/testUp5.txt";  // Destination is PATH + FILE_NAME
	
	// FROM COPY:
	//public static String source = "s/jtea/Shared Documents/ReadMe.txt";
	//public static String destination = "s/jtea/testLib1 / testExercise3 / tes tMission 1 / testTask33 3 / ReadMe3.txt ";
//	public static String testPath = "s/jtea/testLib1 / testExercise3 / tes tMission 1 / testTask33 3 / ";
	
	@Test
    public void buildSoapXMLTest()
	{
		//TODO: Testing!!!
		//logger.debug(UPLOAD_TEST_SOAP);
//		String splitTestString = "/this/is/just/a/test";
//		String[] splitString = splitTestString.split("/");
//		
//		logger.debug("Split Tokens: "  + splitString.length);
//		
//		for(String str : splitString)
//		{
//			logger.debug("splitString: "  +  str);
//		}
//		
//		logger.debug("TestPath Trimmed: " + SharePoint2010FileManagementService.getTrimmedPath(testPath));
    }
}
