package com.ecscompliance.sendEmail.config;

import com.postmarkapp.postmark.Postmark;
import com.postmarkapp.postmark.client.ApiClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApiClientConfig {
    @Value("${postmark.api.secretKey}")
    private String secretKey;

    @Bean
    public ApiClient apiClient(){
        return Postmark.getApiClient(secretKey);
    }
}
