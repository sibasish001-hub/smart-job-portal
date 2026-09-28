package com.jobportal.util;

import com.jobportal.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Component
@Slf4j
public class ResumeParser {

    public String parse(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new BadRequestException("Filename cannot be null");
        }

        String lowercaseFilename = filename.toLowerCase();
        try (InputStream inputStream = file.getInputStream()) {
            if (lowercaseFilename.endsWith(".pdf")) {
                return parsePdf(inputStream);
            } else if (lowercaseFilename.endsWith(".docx")) {
                return parseDocx(inputStream);
            } else {
                throw new BadRequestException("Unsupported file type. Only PDF and DOCX files are supported.");
            }
        } catch (IOException e) {
            log.error("Failed to parse file: {}", filename, e);
            throw new RuntimeException("Failed to read the uploaded resume file.", e);
        }
    }

    private String parsePdf(InputStream inputStream) throws IOException {
        byte[] bytes = inputStream.readAllBytes();
        try (PDDocument document = Loader.loadPDF(bytes)) {
            PDFTextStripper pdfStripper = new PDFTextStripper();
            String text = pdfStripper.getText(document);
            if (text == null || text.trim().isEmpty()) {
                throw new BadRequestException("The uploaded PDF resume is empty or not readable.");
            }
            return text;
        }
    }

    private String parseDocx(InputStream inputStream) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            String text = extractor.getText();
            if (text == null || text.trim().isEmpty()) {
                throw new BadRequestException("The uploaded DOCX resume is empty.");
            }
            return text;
        }
    }
}
