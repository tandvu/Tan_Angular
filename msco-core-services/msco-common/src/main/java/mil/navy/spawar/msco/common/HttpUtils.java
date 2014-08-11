package mil.navy.spawar.msco.common;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.apache.http.Header;
import org.apache.http.auth.AuthenticationException;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.auth.BasicScheme;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.protocol.HTTP;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HttpUtils
{
	private static final Logger logger = LoggerFactory.getLogger(HttpUtils.class);
	
	public static String doHttpGet(String uri)
	{
		HttpGet httpget = new HttpGet(uri);
		return makeHttpRequest(httpget);
	}
	
	public static String doHttpGet(String uri, String user, String pass)
	{
		HttpGet httpget = new HttpGet(uri);
		
		//Set the Authorization Header
		UsernamePasswordCredentials credentials = new UsernamePasswordCredentials(user, pass);
        BasicScheme scheme = new BasicScheme();

        // TODO: Context needs to be non-null?
        Header authorizationHeader;
		try {
			authorizationHeader = scheme.authenticate(credentials, httpget, null);
			httpget.addHeader(authorizationHeader);
		} catch (AuthenticationException e) {
			logger.error("Couldn't add authorization header.", e);
		}
        
		return makeHttpRequest(httpget);
	}
	
	public static <T> String doHttpPost(String serviceEndpoint, T entry)
	{
		return HttpUtils.doHttpPostJson(serviceEndpoint, JsonUtils.toJsonString(entry));
	}
	
	public static String doHttpPostJson(String uri, String json)
	{
		HttpPost httpPost = new HttpPost(uri);
        StringEntity jsonEntity = null;
        
        try
		{
			jsonEntity = new StringEntity(json);
		} 
		catch (UnsupportedEncodingException e1) {
			// TODO Auto-generated catch block
			logger.error("JSON POST Body is Invalid", e1);
			return "";
		}
		
        httpPost.setEntity(jsonEntity);
        httpPost.addHeader("content-type", "application/json");
        
        return makeHttpRequest(httpPost);
	}
	
	public static String doHttpPutJson(String uri, String json)
	{
		HttpPut httpPut = new HttpPut(uri);
        StringEntity jsonEntity = null;
        
        try
		{
			jsonEntity = new StringEntity(json);
		} 
		catch (UnsupportedEncodingException e1) {
			// TODO Auto-generated catch block
			logger.error("JSON PUT Body is Invalid", e1);
			return "";
		}
		
        httpPut.setEntity(jsonEntity);
        httpPut.addHeader("content-type", "application/json");
        
        return makeHttpRequest(httpPut);
	}
	
	public static String doHttpPost(String uri, String postBody, ContentType contentType, HashMap<String,String> headerHash, 
			String user, String pass)
	{
		HttpPost httpPost = new HttpPost(uri);
		httpPost.setHeader("Accept", "*/*");
		httpPost.setHeader(HTTP.CONTENT_TYPE, contentType.toString());
		
		//Set the Authorization Header
		UsernamePasswordCredentials credentials = new UsernamePasswordCredentials(user, pass);
        BasicScheme scheme = new BasicScheme();

        // TODO: Context needs to be non-null?
        Header authorizationHeader;
		try {
			authorizationHeader = scheme.authenticate(credentials, httpPost, null);
			httpPost.setHeader(authorizationHeader);
		} catch (AuthenticationException e) {
			logger.error("Couldn't add authorization header.", e);
		}
		
		// Add headers
		if (headerHash != null) {
			Set<String> keySet = headerHash.keySet();
			Iterator<String> iter = keySet.iterator();
	
			while (iter.hasNext()) {
				String key = iter.next();
				httpPost.setHeader(key, headerHash.get(key));
			}
		}
		
		StringEntity jsonEntity = new StringEntity(postBody, "UTF-8");
		jsonEntity.setContentType(contentType.toString());
		jsonEntity.setChunked(false);
		
		httpPost.setEntity(jsonEntity);
		
		return makeHttpRequest(httpPost);
	}
	
	public static String makeHttpRequest(HttpRequestBase request)
	{
		String result = "";
		
		if(request != null)
		{
			logger.debug("Making " + request.getMethod() + " request to URI: " + request.getURI());
            
			CloseableHttpClient httpClient = HttpClients.createDefault();
	        CloseableHttpResponse response = null;
	        
	        try
	        {
	            response = httpClient.execute(request);
	            
	            BufferedReader br = new BufferedReader(new InputStreamReader((
	            		response.getEntity().getContent())));

	            StringBuilder sb = new StringBuilder();
	            String s;
	            while ((s = br.readLine()) != null) {
	                sb.append(s);
	            }
	           
	            result = sb.toString();
	            logger.debug("Server Response Code: " + response.getStatusLine().getStatusCode() + ", " + result);
	        } catch (ClientProtocolException e) {
	        	logger.error("Client protocol error in HTTP Request", e);
	        } catch (IOException e) {
	        	logger.error("IO Error in HTTP Request", e);
	        }
	        finally
	        {
	        	 try {
	        		 httpClient.close();
	             } catch (IOException e) {
	            	 logger.error("IO Error Closing HTTP Request", e);
	             }
	        }
		}
		
		return result;
	}
	
	public static String getEndpoint(String protocol, String address, String port, List<String> pathList)
	{
		StringBuilder sb = new StringBuilder("");

		sb.append(protocol);
		sb.append("://");
		sb.append(address);
//		sb.append(":");
//		sb.append(port);
		sb.append("/");

		if (pathList != null)
		{
			for (int i = 0; i < pathList.size(); i++)
			{
				String path = pathList.get(i);

				if (path != null && !path.isEmpty())
				{
					if(path.startsWith("/"))
					{	
						sb.append(path.substring(1));
					}
					else
					{
						sb.append(path);
					}

					if((i != (pathList.size() - 1))&&(!path.endsWith("/"))) {
						sb.append("/");
					}
				}
			}
		}

		return sb.toString();
	}
}
