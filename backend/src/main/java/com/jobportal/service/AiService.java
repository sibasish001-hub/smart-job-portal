package com.jobportal.service;

import com.jobportal.dto.JobMatchResponse;
import com.jobportal.dto.ResumeAnalysisResponse;

public interface AiService {
    ResumeAnalysisResponse analyzeResume(String resumeText);
    JobMatchResponse evaluateJobMatch(String resumeText, String jobDescription, String jobRequirements);
}
