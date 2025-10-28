import { Request, Response } from 'express';
import multer from 'multer';
import { CONFIG } from '../config/env.config';

// Configure multer for memory storage (no disk storage)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: CONFIG.APP.MAX_FILE_SIZE, // 1GB max
    files: 10, // Max 10 files at once
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for testing
    cb(null, true);
  },
});

export const handleFileUpload = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
      });
    }

    const uploadStartTime = parseInt(req.body.uploadStartTime || Date.now().toString(), 10);
    const uploadEndTime = Date.now();
    const uploadDuration = (uploadEndTime - uploadStartTime) / 1000; // in seconds

    const fileResults = files.map(file => {
      const fileSizeMB = file.size / (1024 * 1024);
      const uploadSpeed = fileSizeMB / uploadDuration; // MB/s

      return {
        fileName: file.originalname,
        fileSize: file.size,
        fileSizeMB: parseFloat(fileSizeMB.toFixed(2)),
        mimeType: file.mimetype,
        uploadTime: parseFloat(uploadDuration.toFixed(2)),
        uploadSpeed: parseFloat(uploadSpeed.toFixed(2)),
      };
    });

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const totalSizeMB = totalSize / (1024 * 1024);
    const averageSpeed = totalSizeMB / uploadDuration;

    res.json({
      success: true,
      fileCount: files.length,
      totalSize,
      totalSizeMB: parseFloat(totalSizeMB.toFixed(2)),
      uploadDuration: parseFloat(uploadDuration.toFixed(2)),
      averageSpeed: parseFloat(averageSpeed.toFixed(2)),
      files: fileResults,
    });
  } catch (error) {
    console.error('Error in handleFileUpload:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process file upload',
    });
  }
};

export const handleFileDownload = async (req: Request, res: Response) => {
  try {
    const { size } = req.query;
    const sizeInMB = parseInt(size as string, 10) || 1;

    // Limit download size to 500MB
    if (sizeInMB > 500) {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds maximum of 500MB',
      });
    }

    // Generate test file in memory
    const sizeInBytes = sizeInMB * 1024 * 1024;
    const buffer = Buffer.alloc(sizeInBytes, 'x');

    // Set headers for download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="test-file-${sizeInMB}mb.bin"`);
    res.setHeader('Content-Length', sizeInBytes.toString());

    // Send file
    res.send(buffer);
  } catch (error) {
    console.error('Error in handleFileDownload:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate download file',
    });
  }
};

export const handleSpeedTest = async (req: Request, res: Response) => {
  try {
    const { size } = req.query;
    const sizeInMB = parseInt(size as string, 10) || 5;

    // Generate test file for speed test (max 50MB for speed test)
    const limitedSize = Math.min(sizeInMB, 50);
    const sizeInBytes = limitedSize * 1024 * 1024;
    const buffer = Buffer.alloc(sizeInBytes, 'x');

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', sizeInBytes.toString());
    res.setHeader('Cache-Control', 'no-cache');

    res.send(buffer);
  } catch (error) {
    console.error('Error in handleSpeedTest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run speed test',
    });
  }
};
