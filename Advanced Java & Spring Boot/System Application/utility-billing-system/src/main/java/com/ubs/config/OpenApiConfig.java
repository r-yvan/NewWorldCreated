package com.ubs.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Utility Billing System API")
                        .description("""
                                WASAC/REG Utility Billing System — postpaid water and electricity billing.
                                Authenticate via /api/auth/login, then use the Authorize button with: Bearer <token>
                                """)
                        .version("1.0.0")
                        .contact(new Contact().name("UBS Team").email("admin@ubs.rw")))
                .tags(List.of(
                        new Tag().name("Authentication").description("Public signup, login, OTP — no token required"),
                        new Tag().name("Users").description("Admin user management. Deactivate via PATCH status (no hard delete)."),
                        new Tag().name("Customers").description("Customer CRUD. Delete only when no meters/bills exist."),
                        new Tag().name("Meters").description("Meter management. Delete only when no readings/bills exist."),
                        new Tag().name("Meter Readings").description("Operator captures readings. Admin deletes uncorrected readings."),
                        new Tag().name("Tariffs").description("Admin configures tariffs. Deactivate instead of delete when versioned."),
                        new Tag().name("Bills").description("Finance generates/approves/cancels bills. Customers view own bills."),
                        new Tag().name("Payments").description("Finance records payments. Immutable audit trail — no delete."),
                        new Tag().name("Notifications").description("System notifications. DB triggers create bill/payment alerts."),
                        new Tag().name("Files").description("Upload payment evidence or customer documents (PDF/images).")
                ))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
                .components(new Components().addSecuritySchemes(BEARER_AUTH,
                        new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT from POST /api/auth/login")));
    }
}
