package com.paiagent.one.service;

import com.paiagent.one.config.MinioConfig;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.MakeBucketArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URL;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioConfig minioConfig;
    private MinioClient minioClient;

    private MinioClient getClient() {
        if (minioClient == null) {
            minioClient = MinioClient.builder()
                    .endpoint(minioConfig.getEndpoint())
                    .credentials(minioConfig.getAccessKey(), minioConfig.getSecretKey())
                    .build();
        }
        return minioClient;
    }

    public String uploadAudioFromUrl(String audioUrl, String originalFilename) {
        try {
            // Download audio from URL
            URL url = new URL(audioUrl);
            InputStream inputStream = url.openStream();

            // Generate unique filename
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".wav";
            String objectName = "audio/" + UUID.randomUUID().toString() + extension;

            // Ensure bucket exists
            MinioClient client = getClient();
            boolean bucketExists = client.bucketExists(
                    io.minio.BucketExistsArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .build()
            );
            if (!bucketExists) {
                client.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(minioConfig.getBucketName())
                                .build()
                );
            }

            // Upload to MinIO
            client.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .stream(inputStream, -1, 10485760) // max 10MB
                            .contentType("audio/wav")
                            .build()
            );

            inputStream.close();

            // Return public URL
            String publicUrl = minioConfig.getPublicUrl();
            return publicUrl + "/" + minioConfig.getBucketName() + "/" + objectName;

        } catch (Exception e) {
            log.error("Failed to upload audio to MinIO: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload audio to MinIO: " + e.getMessage());
        }
    }
}