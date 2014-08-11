package mil.navy.spawar.msco.common;

import java.io.StringWriter;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

public class XmlUtils {
	private static final Logger logger = LoggerFactory.getLogger(XmlUtils.class);
	
	public static Document buildSoapEnvelope(DocumentBuilder docBuilder) {
		Document doc = null;

		if (docBuilder != null) {
			doc = docBuilder.newDocument();

			// Soap Envelope
			Element soapEnvelope = doc.createElement("soap:Envelope");
			Attr currentAttr = doc.createAttribute("xmlns:soap");
			currentAttr.setValue("http://schemas.xmlsoap.org/soap/envelope/");
			soapEnvelope.setAttributeNode(currentAttr);

			currentAttr = doc.createAttribute("xmlns:xsd");
			currentAttr.setValue("http://www.w3.org/2001/XMLSchema");
			soapEnvelope.setAttributeNode(currentAttr);

			currentAttr = doc.createAttribute("xmlns:xsi");
			currentAttr.setValue("http://www.w3.org/2001/XMLSchema-instance");
			soapEnvelope.setAttributeNode(currentAttr);

			doc.appendChild(soapEnvelope);

			// Soap Body
			Element soapBody = doc.createElement("soap:Body");
			soapEnvelope.appendChild(soapBody);
		}

		return doc;
	}

	public static Element getSoapBodyElement(Document doc) {
		Element result = null;

		if (doc != null) {
			NodeList elementList = doc.getElementsByTagName("soap:Body");

			for (int i = 0; i < elementList.getLength(); i++) {
				if (elementList.item(i) instanceof Element) {
					Element currentElement = (Element) elementList.item(i);
					if (currentElement.getTagName().equals("soap:Body")) {
						result = currentElement;
						break;
					}
				}
			}
		}

		return result;
	}

	public static String domToString(Document doc, Transformer transformer) {
		String result = "";

		if (doc != null && transformer != null) {
			try {
				StringWriter buffer = new StringWriter();
				transformer.transform(new DOMSource(doc), new StreamResult(
						buffer));

				result = buffer.toString();
			} catch (TransformerException e) {
				// TODO Auto-generated catch block
				logger.error("Couldn't create XML from Document", e);
			}
		}

		return result;
	}
	
	public static Element getFirstElementByTagName(Element element, String tagName)
	{
		Element result = null;
		
		NodeList nodeList = element.getElementsByTagName(tagName);
		
		if(nodeList != null && nodeList.getLength() > 0)
		{
			if(nodeList.item(0) instanceof Element)
			{
				result = (Element) nodeList.item(0);
			}
		}
		
		return result;
	}
}
