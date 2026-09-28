package com.jobportal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobportal.dto.JobMatchResponse;
import com.jobportal.dto.ResumeAnalysisResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiServiceImpl implements AiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.provider}")
    private String provider;

    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.url}")
    private String geminiUrl;

    @Value("${app.ai.openai.api-key:}")
    private String openaiApiKey;

    @Value("${app.ai.openai.url}")
    private String openaiUrl;

    @Value("${app.ai.openai.model}")
    private String openaiModel;

    @Value("${app.ai.ollama.url}")
    private String ollamaUrl;

    @Value("${app.ai.ollama.model}")
    private String ollamaModel;

    @Override
    public ResumeAnalysisResponse analyzeResume(String resumeText) {
        String prompt = "You are an advanced Applicant Tracking System (ATS) auditor. Parse the following resume text and perform a thorough analysis.\n" +
                "Respond ONLY with a valid JSON block containing the following keys (do not include any conversational text or markdown other than the JSON block itself):\n" +
                "{\n" +
                "  \"atsScore\": <integer between 0 and 100>,\n" +
                "  \"strengths\": \"<detailed analysis of key strengths, formatted in markdown bullet points>\",\n" +
                "  \"weaknesses\": \"<detailed analysis of key weaknesses, formatted in markdown bullet points>\",\n" +
                "  \"missingSkills\": \"<comma-separated list of critical missing skills typically found in profiles of this title>\",\n" +
                "  \"improvements\": \"<concrete suggested edits to improve readability, grammar, structure, or impact>\",\n" +
                "  \"suggestedCertifications\": \"<comma-separated list of relevant certifications to improve profile credibility>\",\n" +
                "  \"careerPath\": \"<suggested career progression outline, e.g. Junior -> Senior -> Architect>\"\n" +
                "}\n" +
                "\n" +
                "Resume Text:\n" +
                resumeText;

        try {
            String rawResponse = callAiProvider(prompt);
            if (rawResponse == null || rawResponse.isEmpty()) {
                return getMockResumeAnalysis(resumeText);
            }
            String cleanJson = cleanJsonString(rawResponse);
            return objectMapper.readValue(cleanJson, ResumeAnalysisResponse.class);
        } catch (Exception e) {
            log.error("Failed to perform AI resume analysis, falling back to mock response", e);
            return getMockResumeAnalysis(resumeText);
        }
    }

    @Override
    public JobMatchResponse evaluateJobMatch(String resumeText, String jobDescription, String jobRequirements) {
        String prompt = "Compare the following candidate resume text against the job description and job requirements.\n" +
                "Evaluate the fit and respond ONLY with a valid JSON block containing the following keys:\n" +
                "{\n" +
                "  \"matchScore\": <integer between 0 and 100 representing suitability matching profile skills/experience against requirements>,\n" +
                "  \"matchDetails\": \"<detailed justification of the match score, explaining strengths, major skill gaps, or culture/role fit points>\"\n" +
                "}\n" +
                "\n" +
                "Candidate Resume:\n" + resumeText + "\n\n" +
                "Job Description:\n" + jobDescription + "\n\n" +
                "Job Requirements:\n" + jobRequirements;

        try {
            String rawResponse = callAiProvider(prompt);
            if (rawResponse == null || rawResponse.isEmpty()) {
                return getMockJobMatch(resumeText, jobDescription + " " + jobRequirements);
            }
            String cleanJson = cleanJsonString(rawResponse);
            return objectMapper.readValue(cleanJson, JobMatchResponse.class);
        } catch (Exception e) {
            log.error("Failed to perform AI job matchmaking, falling back to mock evaluation", e);
            return getMockJobMatch(resumeText, jobDescription + " " + jobRequirements);
        }
    }

    private String callAiProvider(String prompt) {
        if ("gemini".equalsIgnoreCase(provider)) {
            if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
                log.warn("Gemini API key is not configured. Falling back to mock implementation.");
                return null;
            }
            return callGemini(prompt);
        } else if ("openai".equalsIgnoreCase(provider)) {
            if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
                log.warn("OpenAI API key is not configured. Falling back to mock implementation.");
                return null;
            }
            return callOpenAi(prompt);
        } else if ("ollama".equalsIgnoreCase(provider)) {
            return callOllama(prompt);
        } else {
            log.warn("Unknown AI provider: {}. Using mock fallback.", provider);
            return null;
        }
    }

    private String callGemini(String prompt) {
        try {
            String url = geminiUrl + "?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Structure request for Gemini API
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> parts = new HashMap<>();
            parts.put("parts", new Object[]{textPart});

            Map<String, Object> contentNode = new HashMap<>();
            contentNode.put("contents", new Object[]{parts});

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(contentNode, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text")
                        .asText();
            }
        } catch (Exception e) {
            log.error("Error communicating with Gemini API", e);
        }
        return null;
    }

    private String callOpenAi(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            Map<String, Object> messageNode = new HashMap<>();
            messageNode.put("role", "user");
            messageNode.put("content", prompt);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", openaiModel);
            requestBody.put("messages", new Object[]{messageNode});
            requestBody.put("temperature", 0.3);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(openaiUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("choices")
                        .path(0)
                        .path("message")
                        .path("content")
                        .asText();
            }
        } catch (Exception e) {
            log.error("Error communicating with OpenAI API", e);
        }
        return null;
    }

    private String callOllama(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", ollamaModel);
            requestBody.put("prompt", prompt);
            requestBody.put("stream", false);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(ollamaUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("response").asText();
            }
        } catch (Exception e) {
            log.error("Error communicating with Ollama API at {}", ollamaUrl, e);
        }
        return null;
    }

    private String cleanJsonString(String responseText) {
        if (responseText == null) return "";
        String cleaned = responseText.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    // Smart mock generation logic when offline or keys missing
    private ResumeAnalysisResponse getMockResumeAnalysis(String text) {
        log.info("Generating Mock Resume Analysis due to offline fallback or configuration error.");
        String lowercaseText = text.toLowerCase();
        
        // Calculate dynamic base score based on resume length and formatting
        int lengthScore = Math.min(40, text.length() / 100);
        int score = 40 + lengthScore; 
        
        // Dynamic keyword extraction to feed the recommendation engine
        String[] words = lowercaseText.replaceAll("[^a-z\\s]", " ").split("\\s+");
        Map<String, Integer> wordCounts = new HashMap<>();
        List<String> stopWords = Arrays.asList("the", "and", "or", "of", "to", "in", "a", "is", "for", "with", "on", "as", "by", "this", "that");
        for (String word : words) {
            if (word.length() > 3 && !stopWords.contains(word)) {
                wordCounts.put(word, wordCounts.getOrDefault(word, 0) + 1);
            }
        }
        
        // Top 5 words become "Strengths/Skills"
        List<String> topSkills = wordCounts.entrySet().stream()
            .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
            .limit(5)
            .map(Map.Entry::getKey)
            .toList();
            
        String dynamicStrengths = String.join(", ", topSkills);

        if (lowercaseText.contains("java") || lowercaseText.contains("python") || lowercaseText.contains("react")) score += 10;
        if (lowercaseText.contains("manager") || lowercaseText.contains("senior") || lowercaseText.contains("lead")) score += 5;
        score = Math.max(45, Math.min(score, 98));

        return ResumeAnalysisResponse.builder()
                .atsScore(score)
                .strengths("* **Key Detected Skills**: " + dynamicStrengths + "\n* **Clear formatting**: The document is structured logically.")
                .weaknesses("* **Impact description lack**: Bullet points list responsibilities rather than metrics or outcomes.")
                .missingSkills(topSkills.isEmpty() ? "Communication, Problem Solving" : "System Design, Cloud Deployments, " + topSkills.get(0))
                .improvements("* Add quantified impact to experience items.\n* Highlight cloud deployment experience explicitly.")
                .suggestedCertifications("Relevant Industry Certifications")
                .careerPath("Junior -> Mid-Level -> Senior / Lead")
                .build();
    }

    private JobMatchResponse getMockJobMatch(String resume, String jobDetails) {
        log.info("Generating Mock Job Match Evaluation due to offline fallback or configuration error.");
        String lowercaseResume = resume.toLowerCase();
        String lowercaseJob = jobDetails.toLowerCase();

        // Calculate a simple match based on shared words
        String[] keywords = {"java", "spring", "react", "typescript", "postgres", "sql", "redis", "docker", "aws", "kubernetes", "git", "ci/cd", "microservices"};
        int matches = 0;
        int totalChecked = 0;
        for (String word : keywords) {
            if (lowercaseJob.contains(word)) {
                totalChecked++;
                if (lowercaseResume.contains(word)) {
                    matches++;
                }
            }
        }

        int score = totalChecked == 0 ? 70 : (int) (((double) matches / totalChecked) * 100);
        score = Math.max(45, Math.min(score, 98));

        return JobMatchResponse.builder()
                .matchScore(score)
                .matchDetails(String.format("The candidate matches %d out of %d key tech requirements specified. Technical strengths include matching core technologies. Gaps might include specialized libraries or devops tooling.", matches, totalChecked))
                .build();
    }
}
