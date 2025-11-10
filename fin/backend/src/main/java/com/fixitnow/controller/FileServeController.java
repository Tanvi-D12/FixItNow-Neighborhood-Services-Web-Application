package com.fixitnow.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/uploads")
@CrossOrigin(origins = "*")
public class FileServeController {

    private static final String UPLOAD_DIR = "uploads";

    @GetMapping("/{type}/{filename}")
    public ResponseEntity<?> serveFile(
            @PathVariable String type,
            @PathVariable String filename) {
        try {
            // Validate inputs to prevent directory traversal attacks
            if (type.contains("..") || filename.contains("..")) {
                return ResponseEntity.badRequest().body("Invalid file path");
            }

            // Construct the file path
            Path filePath = Paths.get(UPLOAD_DIR, type, filename);
            File file = filePath.toFile();

            // Check if file exists
            if (!file.exists() || !file.isFile()) {
                System.out.println("DEBUG: File not found: " + filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }

            // Read file content
            byte[] fileContent = Files.readAllBytes(filePath);

            // Determine content type based on file extension
            MediaType mediaType = getMediaType(filename);

            System.out.println("DEBUG: Serving file: " + filePath.toAbsolutePath());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .contentType(mediaType)
                    .body(fileContent);

        } catch (IOException e) {
            System.err.println("Error serving file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to serve file");
        }
    }

    private MediaType getMediaType(String filename) {
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        
        switch (extension) {
            case "jpg":
            case "jpeg":
                return MediaType.IMAGE_JPEG;
            case "png":
                return MediaType.IMAGE_PNG;
            case "gif":
                return MediaType.IMAGE_GIF;
            case "pdf":
                return MediaType.APPLICATION_PDF;
            case "doc":
            case "docx":
                return MediaType.APPLICATION_OCTET_STREAM;
            default:
                return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
