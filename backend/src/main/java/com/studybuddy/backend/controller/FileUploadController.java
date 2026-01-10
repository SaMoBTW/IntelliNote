package com.studybuddy.backend.controller;

import com.studybuddy.backend.dto.DocumentAnalysisResponse;
import com.studybuddy.backend.service.DocumentProcessingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000") // allow React frontend
public class FileUploadController {

    private final DocumentProcessingService documentProcessingService;

    // We "Inject" the service here. Spring automatically finds the Service we
    // created and passes it in.
    @Autowired
    public FileUploadController(DocumentProcessingService documentProcessingService) {
        this.documentProcessingService = documentProcessingService;
    }

    @PostMapping("/upload")
    public ResponseEntity<DocumentAnalysisResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // We delegate the hard work to the service
            DocumentAnalysisResponse response = documentProcessingService.processUploadedFile(file);

            // Return the structured object with a 200 OK status
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            // If something goes wrong, we return a 400 Bad Request with a comprehensive
            // message
            DocumentAnalysisResponse errorResponse = new DocumentAnalysisResponse(
                    file.getOriginalFilename(),
                    "",
                    0,
                    "Error reading file: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}