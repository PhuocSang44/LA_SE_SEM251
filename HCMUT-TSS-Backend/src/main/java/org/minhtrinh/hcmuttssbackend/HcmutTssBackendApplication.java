package org.minhtrinh.hcmuttssbackend;

import org.minhtrinh.hcmuttssbackend.config.FeedbackProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

@SpringBootApplication
@EnableRedisHttpSession
@EnableConfigurationProperties(FeedbackProperties.class)
public class HcmutTssBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(HcmutTssBackendApplication.class, args);
    }
}
