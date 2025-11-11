package org.minhtrinh.hcmuttssbackend;

import lombok.Data;
import lombok.Getter;
import org.minhtrinh.hcmuttssbackend.dto.RecvDatacoreDto;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.io.Serial;
import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

@Data
public class TssUserPrincipal implements OidcUser, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private final OidcUser oidcUser;
    private final RecvDatacoreDto datacoreUser;

    // Updated constructor
    public TssUserPrincipal(OidcUser oidcUser, RecvDatacoreDto datacoreUser) {
        this.oidcUser = oidcUser;
        this.datacoreUser = datacoreUser;
    }

    // --- Provide getters for your custom data ---
    public Integer getOfficialID() {
        return datacoreUser.officialID();
    }

    public String getDepartmentCode() {
        return datacoreUser.departmentCode();
    }
    public String getDepartmentName() {
        return datacoreUser.departmentName();
    }

    // ... other getters for Fname, LastName, UserType, etc. ...
    // --- Delegate all required OidcUser methods to the original oidcUser ---

    @Override
    public Map<String, Object> getClaims() {
        return oidcUser.getClaims();
    }

    @Override
    public OidcUserInfo getUserInfo() {
        return oidcUser.getUserInfo();
    }

    @Override
    public OidcIdToken getIdToken() {
        return oidcUser.getIdToken();
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oidcUser.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return oidcUser.getAuthorities();
    }

    @Override
    public String getName() {
        // You can decide what the "name" is.
        // Using the email (from the name attribute) is common.
        return oidcUser.getName();
    }

    // You could also override getEmail() if OidcUser doesn't provide it directly
    @Override
    public String getEmail() {
        return this.datacoreUser.email(); // Or return oidcUser.getEmail()
    }
}