package com.csv.fileextractor.controller;

import com.csv.fileextractor.model.CSVFile;
import com.csv.fileextractor.repository.CSVFileRepository;
import com.csv.fileextractor.service.CSVDataExtractorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class CSVDataExtractorController {

    @Autowired 
    private CSVDataExtractorService csvDataExtractorService;
    
    @Autowired 
    private CSVFileRepository csvFileRepository;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadCSV(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate file
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "Please select a file to upload");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (!file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
                response.put("success", false);
                response.put("message", "Please upload a CSV file");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Save file to database
            CSVFile savedFile = csvDataExtractorService.saveCSVFile(file);
            
            response.put("success", true);
            response.put("message", "CSV file uploaded successfully");
            response.put("fileId", savedFile.getId());
            response.put("fileName", savedFile.getOriginalFileName());
            response.put("fileSize", savedFile.getFileSize());
            response.put("rowCount", savedFile.getRowCount());
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "Error processing file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/files")
    public ResponseEntity<List<CSVFile>> getAllFiles() {
        List<CSVFile> files = csvDataExtractorService.getAllCSVFiles();
        return ResponseEntity.ok(files);
    }

    @GetMapping("/files/{id}")
    public ResponseEntity<CSVFile> getFileById(@PathVariable Long id) {
        Optional<CSVFile> file = csvDataExtractorService.getCSVFileById(id);
        return file.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/files/search")
    public ResponseEntity<List<CSVFile>> searchFiles(@RequestParam String fileName) {
        List<CSVFile> files = csvDataExtractorService.searchCSVFilesByName(fileName);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/files/status/{status}")
    public ResponseEntity<List<CSVFile>> getFilesByStatus(@PathVariable String status) {
        List<CSVFile> files = csvDataExtractorService.getCSVFilesByStatus(status);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/files/recent")
    public ResponseEntity<List<CSVFile>> getRecentFiles() {
        List<CSVFile> files = csvDataExtractorService.getRecentCSVFiles();
        return ResponseEntity.ok(files);
    }

    @GetMapping("/files/stats")
    public ResponseEntity<Map<String, Object>> getFileStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalFiles = csvFileRepository.count();
        long uploadedFiles = csvDataExtractorService.getCSVFileCountByStatus("UPLOADED");
        long processedFiles = csvDataExtractorService.getCSVFileCountByStatus("PROCESSED");
        long errorFiles = csvDataExtractorService.getCSVFileCountByStatus("ERROR");
        
        stats.put("totalFiles", totalFiles);
        stats.put("uploadedFiles", uploadedFiles);
        stats.put("processedFiles", processedFiles);
        stats.put("errorFiles", errorFiles);
        
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/files/{id}/status")
    public ResponseEntity<CSVFile> updateFileStatus(@PathVariable Long id, @RequestParam String status) {
        CSVFile updatedFile = csvDataExtractorService.updateCSVFileStatus(id, status);
        if (updatedFile != null) {
            return ResponseEntity.ok(updatedFile);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/files/{id}/description")
    public ResponseEntity<CSVFile> updateFileDescription(@PathVariable Long id, @RequestParam String description) {
        CSVFile updatedFile = csvDataExtractorService.updateCSVFileDescription(id, description);
        if (updatedFile != null) {
            return ResponseEntity.ok(updatedFile);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/files/{id}")
    public ResponseEntity<Map<String, Object>> deleteFile(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            csvDataExtractorService.deleteCSVFile(id);
            response.put("success", true);
            response.put("message", "File deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error deleting file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/extract")
    public ResponseEntity<Map<String, Object>> extractCSV(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // This endpoint can be used for server-side processing if needed
            // For now, return success response as frontend handles extraction client-side
            response.put("success", true);
            response.put("message", "Extraction completed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Extraction failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
