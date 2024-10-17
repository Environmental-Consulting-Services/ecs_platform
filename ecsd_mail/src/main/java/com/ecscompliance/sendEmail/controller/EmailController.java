package com.ecscompliance.sendEmail.controller;

import com.ecscompliance.sendEmail.model.CustomMessage;
import com.ecscompliance.sendEmail.service.EmailService;
import com.postmarkapp.postmark.client.ApiClient;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
@RequiredArgsConstructor
public class EmailController {
    private final ApiClient apiClient;
    private final EmailService emailService;

    @GetMapping("/")
    public String home(Model model){
        model.addAttribute("customMessage",
                new CustomMessage());
        model.addAttribute("success",
                false);
        return "index";
    }

    @PostMapping("/send-email")
    public String sendEmail(@ModelAttribute @Valid CustomMessage customMessage,
                            BindingResult bindingResult,
                            Model model){
        if (bindingResult.hasErrors()){
            return "index";
        }

        if (emailService.sendEmail(apiClient, customMessage)){
            model.addAttribute("customMessage",
                    customMessage);
            model.addAttribute("success",
                    true);
            return "index";
        }
        model.addAttribute("customMessage",
                new CustomMessage());
        model.addAttribute("success",
                false);
        return "index";
    }
}
