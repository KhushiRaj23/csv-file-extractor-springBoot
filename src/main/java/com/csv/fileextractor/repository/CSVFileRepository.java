package com.csv.fileextractor.repository;

import com.csv.fileextractor.model.CSVFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CSVFileRepository extends JpaRepository<CSVFile, Long> {
    
    // Find by original filename
    Optional<CSVFile> findByOriginalFileName(String originalFileName);
    
    // Find by status
    List<CSVFile> findByStatus(String status);
    
    // Find by file size greater than
    List<CSVFile> findByFileSizeGreaterThan(Long fileSize);
    
    // Find files uploaded in the last 24 hours
    @Query("SELECT c FROM CSVFile c WHERE c.createdAt >= CURRENT_DATE")
    List<CSVFile> findRecentFiles();
    
    // Find files by partial filename match
    List<CSVFile> findByOriginalFileNameContainingIgnoreCase(String fileName);
    
    // Count files by status
    long countByStatus(String status);
} 