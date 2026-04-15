package com.proyectoinvdebienes.backend.service;

import com.proyectoinvdebienes.backend.domain.model.UserAccount;
import com.proyectoinvdebienes.backend.repository.UserAccountRepository;
import com.proyectoinvdebienes.backend.web.dto.CreateUserRequest;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public UserAccountService(UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserAccount createUser(CreateUserRequest request) {
        userAccountRepository.findByUsername(request.username())
                .ifPresent(existing -> {
                    throw new BusinessException("El nombre de usuario ya existe");
                });

        UserAccount account = new UserAccount();
        account.setUsername(request.username());
        account.setPassword(passwordEncoder.encode(request.password()));
        account.setRole(request.role());

        return userAccountRepository.save(account);
    }

    public List<UserAccount> listUsers() {
        return userAccountRepository.findAll();
    }
}
