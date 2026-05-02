package com.paiagent.one;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PaiAgentOneApplication {
    public static void main(String[] args) {
        SpringApplication.run(PaiAgentOneApplication.class, args);
    }
}
