package com.csv.fileextractor.service;

import com.csv.fileextractor.model.CSVFile;
import com.csv.fileextractor.repository.CSVFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CSVDataExtractorService {

    @Autowired
    private CSVFileRepository csvFileRepository;

    public CSVFile saveCSVFile(MultipartFile file) throws IOException {
        // Read file content
        String fileContent = new String(file.getBytes(), StandardCharsets.UTF_8);
        
        // Generate unique filename
        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        
        // Parse CSV to get headers and row count
        String[] lines = fileContent.split("\n");
        String headers = lines.length > 0 ? lines[0] : "";
        int rowCount = Math.max(0, lines.length - 1); // Exclude header row
        
        // Create CSVFile entity
        CSVFile csvFile = new CSVFile();
        csvFile.setFileName(uniqueFileName);
        csvFile.setOriginalFileName(file.getOriginalFilename());
        csvFile.setFileContent(fileContent);
        csvFile.setFileSize(file.getSize());
        csvFile.setFileType(file.getContentType());
        csvFile.setHeaders(headers);
        csvFile.setRowCount(rowCount);
        csvFile.setStatus("UPLOADED");
        csvFile.setDescription("CSV file uploaded via web interface");
        
        // Save to database
        return csvFileRepository.save(csvFile);
    }

    public List<CSVFile> getAllCSVFiles() {
        return csvFileRepository.findAll();
    }

    public Optional<CSVFile> getCSVFileById(Long id) {
        return csvFileRepository.findById(id);
    }

    public Optional<CSVFile> getCSVFileByOriginalName(String originalFileName) {
        return csvFileRepository.findByOriginalFileName(originalFileName);
    }

    public List<CSVFile> getCSVFilesByStatus(String status) {
        return csvFileRepository.findByStatus(status);
    }

    public List<CSVFile> getRecentCSVFiles() {
        return csvFileRepository.findRecentFiles();
    }

    public List<CSVFile> searchCSVFilesByName(String fileName) {
        return csvFileRepository.findByOriginalFileNameContainingIgnoreCase(fileName);
    }

    public long getCSVFileCountByStatus(String status) {
        return csvFileRepository.countByStatus(status);
    }

    public void deleteCSVFile(Long id) {
        csvFileRepository.deleteById(id);
    }

    public CSVFile updateCSVFileStatus(Long id, String status) {
        Optional<CSVFile> optionalFile = csvFileRepository.findById(id);
        if (optionalFile.isPresent()) {
            CSVFile file = optionalFile.get();
            file.setStatus(status);
            return csvFileRepository.save(file);
        }
        return null;
    }

    public CSVFile updateCSVFileDescription(Long id, String description) {
        Optional<CSVFile> optionalFile = csvFileRepository.findById(id);
        if (optionalFile.isPresent()) {
            CSVFile file = optionalFile.get();
            file.setDescription(description);
            return csvFileRepository.save(file);
        }
        return null;
    }
}
