package com.unilms.repository;

import com.unilms.domain.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    Optional<Course> findBySlugAndDeletedAtIsNull(String slug);
    List<Course> findByIsPublishedTrueAndDeletedAtIsNull();
}
