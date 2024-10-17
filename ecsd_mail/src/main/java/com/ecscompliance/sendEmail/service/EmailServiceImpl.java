package com.ecscompliance.sendEmail.service;

import com.ecscompliance.sendEmail.model.CustomMessage;
import com.postmarkapp.postmark.client.ApiClient;
import com.postmarkapp.postmark.client.data.model.message.Message;
import com.postmarkapp.postmark.client.exception.PostmarkException;
import org.springframework.stereotype.Service;

import java.io.IOException;
@Service
public class EmailServiceImpl implements EmailService{
    private static final String FROM = "no-reply@ecscompliance.com";

    @Override
    public Boolean sendEmail(ApiClient client, CustomMessage customMessage) {
        boolean isMessageSent = false;
        Message message = new Message(
                FROM,
                customMessage.getTo(),
                customMessage.getSubject(),
                        """
                        <!doctype html>
                        <html lang="en">
                          <head>
                          </head>
                          <body>
                          <p>%s</p>
                          </body>
                        </html>
                                                    
                        """.formatted(customMessage.getMessage())
        );

        message.setMessageStream("outbound");

        try {
            if (client.deliverMessage(message)
                    .getMessageId() != null)
                isMessageSent = true;
        } catch (PostmarkException | IOException e) {
            throw new RuntimeException(e);
        }

        return isMessageSent;
    }
}