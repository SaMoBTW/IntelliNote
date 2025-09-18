package com.studybuddy.backend.controller;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000") // allow React frontend
public class FileUploadController {

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String textContent;

            if (file.getOriginalFilename() != null && file.getOriginalFilename().endsWith(".pdf")) {
                // Extract text from PDF
                try (PDDocument document = PDDocument.load(file.getInputStream())) {
                    PDFTextStripper pdfStripper = new PDFTextStripper();
                    textContent = pdfStripper.getText(document);
                }
            } else {
                // Assume plain text file
                textContent = new String(file.getBytes());
            }

            // Return only a preview so frontend isn’t overwhelmed
            String preview = textContent.length() > 1000
                    ? textContent.substring(0, 1000)
                    : textContent;

            return ResponseEntity.ok(preview);

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error reading file: " + e.getMessage());
        }
    }
}