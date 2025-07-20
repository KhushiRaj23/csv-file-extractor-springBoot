package com.csv.fileextractor.repository;

import com.csv.fileextractor.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CSVDataExtractorRepository extends JpaRepository<User,Long> {
}
