package com.csv.fileextractor.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "csv_files")
@Data
public class CSVFile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String fileName;
    
    @Column(nullable = false)
    private String originalFileName;
    
    @Column(columnDefinition = "TEXT")
    private String fileContent;
    
    @Column
    private Long fileSize;
    
    @Column
    private String fileType;
    
    @Column
    private String headers;
    
    @Column
    private Integer rowCount;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column
    private String description;
    
    @Column
    private String status; // UPLOADED, PROCESSED, ERROR
} 