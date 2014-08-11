package mil.navy.spawar.msco.processautomationservice;

import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A Poller for the PAS
 * 
 */
public class ProcessAutomationServicePoller implements Runnable {
    
	private static final Logger logger = LoggerFactory.getLogger(ProcessAutomationServicePoller.class);
	
	private boolean stopPolling;
    private boolean pausePolling;
    
    private Date exercisesNextRefreshTime;
	private Date missionsNextRefreshTime;
	private Date taskNextRefreshTime;
	
    public ProcessAutomationServicePoller()
    {
    	exercisesNextRefreshTime = new Date(1);
		missionsNextRefreshTime = new Date(1);
		taskNextRefreshTime = new Date(1);
		
		stopPolling = false;
		pausePolling = false;
    }

    /*
     * (non-Javadoc)
     * 
     * @see java.lang.Runnable#run()
     */
    public void run()
    {
        while(!stopPolling)
        {
        	try {
	        	synchronized(this)
		        {
		        	if(stopPolling)
		        	{
		        		break;
		        	}
		        	else if(pausePolling)
		        	{
		        		wait();
		        	}
		        }
        	} catch (InterruptedException e) {
        		logger.error("PAS Poller was unexpectedly awoken...", e);
            }
        	
        	if(exercisesNextRefreshTime.before(new Date()))
    		{
    			ProcessAutomationService.getInstance().refreshExercises();
    			
    			exercisesNextRefreshTime = new Date(System.currentTimeMillis() + 
    					ProcessAutomationService.getInstance().getConfiguration().getExerciseRefreshMs());
    		}
    		
    		if(missionsNextRefreshTime.before(new Date()))
    		{
    			ProcessAutomationService.getInstance().refreshMissions();
    			
    			missionsNextRefreshTime = new Date(System.currentTimeMillis() + 
    					ProcessAutomationService.getInstance().getConfiguration().getMissionRefreshMs());
    		}
    		
    		if(taskNextRefreshTime.before(new Date()))
    		{
    			ProcessAutomationService.getInstance().refreshTasks();
    			ProcessAutomationService.getInstance().advanceSimulatedTasks();
    			
    			taskNextRefreshTime = new Date(System.currentTimeMillis() + 
    					ProcessAutomationService.getInstance().getConfiguration().getTaskRefreshMs());
    		}
    		
        	//sleep until the next polling time
    		synchronized(this)
	        {
	    		long sleepTimeMs = getMsToNextPoll();
	    		if(sleepTimeMs > 0)
	    		{
	    			logger.debug("PAS is waiting to poll for " + sleepTimeMs + " ms...");
	    			
	    			try
					{
						wait(sleepTimeMs);
					} 
	    			catch (InterruptedException e)
					{
						// TODO Auto-generated catch block
						logger.error("PAS Poller was unexpectedly awoken...", e);
					}
	    		}
	        }
        }  	
    }

    public synchronized void stopPolling(boolean stop) {
        stopPolling = stop;
    }
    
    public synchronized void pausePolling(boolean pause) {
    	pausePolling = pause;
    	
    	if(!pausePolling)
    	{
    		notifyAll();
    	}
    }
    
    public boolean isPaused()
    {
    	return pausePolling;
    }
    
    private long getMsToNextPoll()
    {
    	Long[] nextRefreshTimeArray = { exercisesNextRefreshTime.getTime(), 
    								missionsNextRefreshTime.getTime(),
    								taskNextRefreshTime.getTime() };
    	
    	List<Long> nextRefreshTimeList = Arrays.asList(nextRefreshTimeArray);
    	return (Collections.min(nextRefreshTimeList) - System.currentTimeMillis());
    }

	public Date getExercisesNextRefreshTime() {
		return exercisesNextRefreshTime;
	}

	public Date getMissionsNextRefreshTime() {
		return missionsNextRefreshTime;
	}

	public Date getTaskNextRefreshTime() {
		return taskNextRefreshTime;
	}
}

