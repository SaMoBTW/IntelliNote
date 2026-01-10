package com.studybuddy.backend.dto;

public class DocumentAnalysisResponse {
    private String fileName;
    private String previewText;
    private int totalCharacterCount;

    // specific message for the user, if needed
    private String message;

    public DocumentAnalysisResponse(String fileName, String previewText, int totalCharacterCount, String message) {
        this.fileName = fileName;
        this.previewText = previewText;
        this.totalCharacterCount = totalCharacterCount;
        this.message = message;
    }

    // Getters and Setters are needed for Spring to convert this to JSON
    // automatically

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getPreviewText() {
        return previewText;
    }

    public void setPreviewText(String previewText) {
        this.previewText = previewText;
    }

    public int getTotalCharacterCount() {
        return totalCharacterCount;
    }

    public void setTotalCharacterCount(int totalCharacterCount) {
        this.totalCharacterCount = totalCharacterCount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
