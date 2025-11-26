package org.minhtrinh.hcmuttssbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

@SpringBootApplication
@EnableRedisHttpSession
@EnableScheduling
public class HcmutTssBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(HcmutTssBackendApplication.class, args);
    }
}
