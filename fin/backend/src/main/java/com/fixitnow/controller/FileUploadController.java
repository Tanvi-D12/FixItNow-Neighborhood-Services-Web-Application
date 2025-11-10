package com.fixitnow.controller;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_EXTENSIONS = { "jpg", "jpeg", "png", "gif", "pdf", "doc", "docx" };

    @PostMapping
    public ResponseEntity<?> uploadFile(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "type", defaultValue = "avatar") String type) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("DEBUG: Upload endpoint called");
            System.out.println("DEBUG: File: " + (file != null ? file.getOriginalFilename() : "null"));
            System.out.println("DEBUG: Type: " + type);

            // Validate file
            if (file == null || file.isEmpty()) {
                System.out.println("ERROR: File is null or empty");
                response.put("message", "No file provided");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file size
            if (file.getSize() > MAX_FILE_SIZE) {
                System.out.println("ERROR: File size exceeds limit: " + file.getSize());
                response.put("message", "File size exceeds 5MB limit");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file extension
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            
            System.out.println("DEBUG: File extension: " + fileExtension);
            
            if (!isAllowedExtension(fileExtension)) {
                System.out.println("ERROR: File type not allowed: " + fileExtension);
                response.put("message", "File type not allowed. Allowed types: jpg, jpeg, png, gif, pdf, doc, docx");
                return ResponseEntity.badRequest().body(response);
            }

            // Create upload directory if it doesn't exist
            File uploadDirectory = new File(UPLOAD_DIR);
            if (!uploadDirectory.exists()) {
                boolean created = uploadDirectory.mkdirs();
                System.out.println("DEBUG: Created upload directory: " + uploadDirectory.getAbsolutePath() + " (success: " + created + ")");
            }

            // Generate unique filename
            String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;
            String typeDirectory = UPLOAD_DIR + File.separator + type;
            File typeDir = new File(typeDirectory);
            if (!typeDir.exists()) {
                boolean created = typeDir.mkdirs();
                System.out.println("DEBUG: Created type directory: " + typeDir.getAbsolutePath() + " (success: " + created + ")");
            }

            // Save file - use File constructor to properly create the destination
            File destinationFile = new File(typeDir, uniqueFilename);
            System.out.println("DEBUG: Destination file path: " + destinationFile.getAbsolutePath());
            System.out.println("DEBUG: Parent directory exists: " + destinationFile.getParentFile().exists());
            System.out.println("DEBUG: Parent directory is writable: " + destinationFile.getParentFile().canWrite());
            
            // Read from input stream and write to file to avoid Tomcat temp directory issues
            try (InputStream inputStream = file.getInputStream();
                 FileOutputStream outputStream = new FileOutputStream(destinationFile)) {
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
                outputStream.flush();
            }
            System.out.println("DEBUG: File saved to: " + destinationFile.getAbsolutePath());

            // Return file URL
            String fileUrl = "/" + typeDirectory.replace("\\", "/") + "/" + uniqueFilename;
            
            response.put("url", fileUrl);
            response.put("filename", uniqueFilename);
            response.put("originalFilename", originalFilename);
            response.put("size", file.getSize());
            response.put("type", type);
            
            System.out.println("DEBUG: Upload successful. URL: " + fileUrl);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            System.out.println("ERROR: IOException during upload: " + e.getMessage());
            e.printStackTrace();
            response.put("message", "Failed to upload file: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(response);
        } catch (Exception e) {
            System.out.println("ERROR: Exception during upload: " + e.getMessage());
            e.printStackTrace();
            response.put("message", "Error: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(response);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    private boolean isAllowedExtension(String extension) {
        for (String allowed : ALLOWED_EXTENSIONS) {
            if (allowed.equals(extension)) {
                return true;
            }
        }
        return false;
    }
}
