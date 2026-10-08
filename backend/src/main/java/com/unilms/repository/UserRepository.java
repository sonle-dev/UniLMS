package com.unilms.repository;

import com.unilms.domain.entity.User;
import com.unilms.domain.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    long countByRole(UserRole role);
    long countByIsActiveTrue();
    List<User> findByRole(UserRole role);
}

