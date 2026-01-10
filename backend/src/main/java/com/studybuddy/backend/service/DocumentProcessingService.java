package com.studybuddy.backend.service;

import com.studybuddy.backend.dto.DocumentAnalysisResponse;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service // This tells Spring that this class holds "business logic" and should be
         // managed automatically
public class DocumentProcessingService {

    /**
     * This method takes the uploaded file, reads it, and returns a nice structured
     * response.
     */
    public DocumentAnalysisResponse processUploadedFile(MultipartFile uploadedFile) throws IOException {
        String fullTextContent = "";

        // Check if the file name ends with ".pdf" (case-insensitive check is better,
        // but this is simple for now)
        String originalFileName = uploadedFile.getOriginalFilename();

        if (originalFileName != null && originalFileName.endsWith(".pdf")) {
            // It's a PDF, so we use the helper method to extract text
            fullTextContent = extractTextFromPdf(uploadedFile);
        } else {
            // It's not a PDF, so we assume it's a plain text file for now
            fullTextContent = new String(uploadedFile.getBytes());
        }

        // Create a short preview (first 1000 characters) to show the user
        String contentPreview = createPreviewSnippet(fullTextContent);

        // Calculate the total length
        int totalCharacterCount = fullTextContent.length();

        // Construct and return the response object
        return new DocumentAnalysisResponse(
                originalFileName,
                contentPreview,
                totalCharacterCount,
                "File processed successfully!");
    }

    /**
     * Helper method strictly for extracting text from a PDF file.
     */
    private String extractTextFromPdf(MultipartFile pdfFile) throws IOException {
        // "try-with-resources" block automatically closes the document when done,
        // preventing memory leaks
        try (PDDocument document = PDDocument.load(pdfFile.getInputStream())) {
            PDFTextStripper textStripper = new PDFTextStripper();
            return textStripper.getText(document);
        }
    }

    /**
     * Helper method to cut the text down to a manageable size for the preview.
     */
    private String createPreviewSnippet(String fullText) {
        int maxPreviewLength = 1000;

        if (fullText.length() > maxPreviewLength) {
            return fullText.substring(0, maxPreviewLength) + "... (truncated)";
        }

        return fullText;
    }
}
