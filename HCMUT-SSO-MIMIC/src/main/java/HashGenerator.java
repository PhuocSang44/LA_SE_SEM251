import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String plainPassword = "secret";

        // Generate and print the hash
        String hashedPassword = encoder.encode(plainPassword);
        System.out.println("Plain Text: " + plainPassword);
        System.out.println("BCrypt Hash: " + hashedPassword);
    }
}