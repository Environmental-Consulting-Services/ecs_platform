package com.ecscompliance.sendEmail.service;

import com.ecscompliance.sendEmail.model.CustomMessage;
import com.postmarkapp.postmark.client.ApiClient;

public interface EmailService {
    Boolean sendEmail(ApiClient client, CustomMessage customMessage);
}
