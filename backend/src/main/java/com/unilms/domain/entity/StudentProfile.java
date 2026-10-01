package com.unilms.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_student_profile_user"))
    private User user;

    @Column(name = "student_code", unique = true, length = 50)
    private String studentCode;

    @Column(name = "class_name", length = 100)
    private String className;

    @Column(name = "major", length = 150)
    private String major;
}
