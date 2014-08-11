package mil.navy.spawar.msco.common.datamodel;

import mil.navy.spawar.msco.common.JsonUtils;

public class VmWorkingStatus {
	private String status;
	private String currentStage;
	private String endStage;
	private String percentComplete;
	private String statusDescription;
	
	public VmWorkingStatus(){}
	
	public VmWorkingStatus(String jsonString)
	{
		VmWorkingStatus vmWorkingStatus = JsonUtils.createFromJsonString(jsonString, VmWorkingStatus.class);
		
		if(vmWorkingStatus != null)
		{
			this.status = vmWorkingStatus.status;
			this.currentStage = vmWorkingStatus.currentStage;
			this.endStage = vmWorkingStatus.endStage;
			this.percentComplete = vmWorkingStatus.percentComplete;
			this.statusDescription = vmWorkingStatus.statusDescription;
		}
	}

	@Override
	public String toString() {
		return "VmWorkingStatus [status=" + status + ", currentStage="
				+ currentStage + ", endStage=" + endStage
				+ ", percentComplete=" + percentComplete
				+ ", statusDescription=" + statusDescription + "]";
	}
	
	public String toJsonString()
	{
		return JsonUtils.toJsonString(this);
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getCurrentStage() {
		return currentStage;
	}

	public void setCurrentStage(String currentStage) {
		this.currentStage = currentStage;
	}

	public String getEndStage() {
		return endStage;
	}

	public void setEndStage(String endStage) {
		this.endStage = endStage;
	}

	public String getPercentComplete() {
		return percentComplete;
	}

	public void setPercentComplete(String percentComplete) {
		this.percentComplete = percentComplete;
	}

	public String getStatusDescription() {
		return statusDescription;
	}

	public void setStatusDescription(String statusDescription) {
		this.statusDescription = statusDescription;
	}
}
