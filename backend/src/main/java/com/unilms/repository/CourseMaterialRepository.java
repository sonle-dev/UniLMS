package com.unilms.repository;

import com.unilms.domain.entity.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, UUID> {
    List<CourseMaterial> findByCourseIdOrderByCreatedAtDesc(UUID courseId);
    List<CourseMaterial> findAllByOrderByCreatedAtDesc();
}
