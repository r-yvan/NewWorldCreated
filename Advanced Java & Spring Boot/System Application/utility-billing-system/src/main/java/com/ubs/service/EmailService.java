package com.ubs.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${MAIL_FROM:no-reply@ubs.rw}")
    private String mailFrom;

    @Async
    public void sendEmail(String to, String subject, String body) {
        doSendEmail(to, subject, body);
    }

    public boolean sendEmailSync(String to, String subject, String body) {
        return doSendEmail(to, subject, body);
    }

    private boolean doSendEmail(String to, String subject, String body) {
        try {
            if (mailSender == null) {
                log.warn("Mail sender not configured; skipping email to {}", to);
                return false;
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            return false;
        }
    }
}
