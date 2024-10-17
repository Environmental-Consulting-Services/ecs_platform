package com.ecscompliance.sendEmail.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CustomMessage {
    @Email
    @NotBlank
    private String to;

    @NotBlank
    @Size(min = 10, max = 200)
    private String subject;

    @NotBlank
    @Size(min = 10, max = 200)
    private String message;
}
