package com.unilms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class UniLmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(UniLmsApplication.class, args);
    }
}
