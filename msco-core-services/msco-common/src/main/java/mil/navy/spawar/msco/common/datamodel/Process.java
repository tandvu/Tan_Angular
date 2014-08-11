package mil.navy.spawar.msco.common.datamodel;

import mil.navy.spawar.msco.common.JsonUtils;

public class Process {
	private String _id;
	private String name;
	private String version;
	private String packageName;
	private String type;
	private String knowledgeType;
	private String namespace;
	private String originalPath;
	private String deploymentId;
	private String encodedProcessSource;
	
	public Process(){}
	
	public Process(String jsonString)
	{
		Process process = JsonUtils.createFromJsonString(jsonString, Process.class);
		
		if(process != null)
		{
			this._id = process._id;
			this.name = process.name;
			this.version = process.version;
			this.packageName = process.packageName;
			this.type = process.type;
			this.knowledgeType = process.knowledgeType;
			this.namespace = process.namespace;
			this.originalPath = process.originalPath;
			this.deploymentId = process.deploymentId;
			this.encodedProcessSource = process.encodedProcessSource;
		}
	}

	@Override
	public String toString() {
		return "Process [_id=" + _id + ", name=" + name + ", version="
				+ version + ", packageName=" + packageName + ", type=" + type
				+ ", knowledgeType=" + knowledgeType + ", namespace="
				+ namespace + ", originalPath=" + originalPath
				+ ", deploymentId=" + deploymentId + ", encodedProcessSource="
				+ encodedProcessSource + "]";
	}
	
	public String toJsonString()
	{
		return JsonUtils.toJsonString(this);
	}

	public String get_id() {
		return _id;
	}

	public void set_id(String _id) {
		this._id = _id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public String getPackageName() {
		return packageName;
	}

	public void setPackageName(String packageName) {
		this.packageName = packageName;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getKnowledgeType() {
		return knowledgeType;
	}

	public void setKnowledgeType(String knowledgeType) {
		this.knowledgeType = knowledgeType;
	}

	public String getNamespace() {
		return namespace;
	}

	public void setNamespace(String namespace) {
		this.namespace = namespace;
	}

	public String getOriginalPath() {
		return originalPath;
	}

	public void setOriginalPath(String originalPath) {
		this.originalPath = originalPath;
	}

	public String getDeploymentId() {
		return deploymentId;
	}

	public void setDeploymentId(String deploymentId) {
		this.deploymentId = deploymentId;
	}

	public String getEncodedProcessSource() {
		return encodedProcessSource;
	}

	public void setEncodedProcessSource(String encodedProcessSource) {
		this.encodedProcessSource = encodedProcessSource;
	}
}
