package com.jobportal.storage;

import com.jobportal.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class StorageServiceImpl implements StorageService {

    private final Path rootLocation;

    public StorageServiceImpl(@Value("${app.upload.dir}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir);
    }

    @Override
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            log.info("Initialized upload directory at: {}", rootLocation.toAbsolutePath());
        } catch (IOException e) {
            log.error("Could not initialize storage directory", e);
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    @Override
    public String store(MultipartFile file, String subDir) {
        try {
            if (file.isEmpty()) {
                throw new BadRequestException("Failed to store empty file.");
            }

            Path destinationDir = this.rootLocation.resolve(subDir);
            Files.createDirectories(destinationDir);

            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String storedFilename = UUID.randomUUID() + fileExtension;
            Path destinationFile = destinationDir.resolve(Paths.get(storedFilename))
                    .normalize().toAbsolutePath();

            if (!destinationFile.getParent().equals(destinationDir.toAbsolutePath())) {
                // This is a security check to prevent relative path traversal
                throw new BadRequestException("Cannot store file outside current directory.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
                log.info("Stored file: {} as {}", originalFilename, destinationFile);
                return subDir + "/" + storedFilename;
            }
        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    @Override
    public Path load(String filename) {
        return rootLocation.resolve(filename);
    }

    @Override
    public Resource loadAsResource(String filename) {
        try {
            Path file = load(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new BadRequestException("Could not read file: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new BadRequestException("Could not read file: " + filename);
        }
    }

    @Override
    public void delete(String filename) {
        try {
            Path file = load(filename);
            Files.deleteIfExists(file);
            log.info("Deleted file: {}", filename);
        } catch (IOException e) {
            log.error("Could not delete file: {}", filename, e);
        }
    }
}
