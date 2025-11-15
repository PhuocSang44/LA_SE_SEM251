package org.minhtrinh.hcmuttssbackend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class DatacoreClient {

    private static final Logger log = LoggerFactory.getLogger(DatacoreClient.class);

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${datacore.url:http://localhost:10005}")
    private String datacoreUrl;

    public record EligibilityResponse(boolean eligible, String[] missing) {}

    public EligibilityResponse checkPrerequisitesByEmail(String courseCode, String email) {
        try {
            String url = String.format("%s/courses/%s/eligible?email=%s", datacoreUrl, courseCode, email);
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                log.warn("Datacore returned non-2xx for prereq check: {}", resp.getStatusCode());
                return new EligibilityResponse(true, new String[0]); // fail-open: allow when datacore fails
            }
            Map body = resp.getBody();
            boolean eligible = body.containsKey("eligible") ? Boolean.parseBoolean(String.valueOf(body.get("eligible"))) : true;
            Object missingObj = body.get("missing");
            String[] missing = new String[0];
            if (missingObj instanceof java.util.List list) {
                missing = (String[]) list.toArray(new String[0]);
            }
            return new EligibilityResponse(eligible, missing);
        } catch (Exception ex) {
            log.error("Error calling datacore for prereq check", ex);
            return new EligibilityResponse(true, new String[0]); // fail-open
        }
    }
}
