import axios, { AxiosInstance } from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // In production (Netlify), use serverless functions
  if (process.env.NODE_ENV === 'production') {
    return '/.netlify/functions';
  }
  // In development, use environment variable or localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:3005/api';
};

const API_URL = getApiUrl();

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 120000, // 2 minutes timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Email test - Netlify Function: send-email
  async sendTestEmail(email: string) {
    const response = await this.api.post('/send-email', { email, type: 'test' });
    return response.data;
  }

  async verifyEmailCode(email: string, code: string) {
    const response = await this.api.post('/verify-email', { email, code });
    return response.data;
  }

  // 2FA test - Netlify Function: send-email
  async send2FACode(email: string) {
    const response = await this.api.post('/send-email', { email, type: '2fa' });
    return response.data;
  }

  async verify2FACode(email: string, code: string) {
    const response = await this.api.post('/verify-email', { email, code });
    return response.data;
  }

  // Domain test - Netlify Function: test-domain
  async testDomainAccess() {
    const response = await this.api.get('/test-domain');
    return response.data;
  }

  // File download test - Netlify Function: file-download
  async testFileDownload() {
    try {
      // First, try to get as JSON (for smaller ZIPs)
      const response = await this.api.get('/file-download', {
        responseType: 'json'
      });
      
      // Check if we got JSON response with base64
      if (response.data && response.data.metadata?.zipFile) {
        return response.data;
      }
      
      // If response is binary (Content-Type: application/zip), handle it differently
      return response.data;
    } catch (error: any) {
      // If JSON parsing fails, might be binary response
      if (error.response) {
        const contentType = error.response.headers['content-type'];
        if (contentType && contentType.includes('application/zip')) {
          // Re-fetch as blob for direct download
          const blobResponse = await this.api.get('/file-download', {
            responseType: 'blob'
          });
          return {
            success: true,
            message: 'ZIP file ready',
            details: 'Large ZIP file ready for download',
            blob: blobResponse.data
          };
        }
      }
      throw error;
    }
  }

  // Download all test files at once
  async downloadAllFiles(files: Array<{ name: string; content: string; type: string; encoding?: string }>) {
    files.forEach(file => {
      let blob: Blob;
      
      if (file.encoding === 'base64') {
        // Decode base64 content for binary files
        const binaryString = window.atob(file.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: file.type || 'application/octet-stream' });
      } else {
        // Plain text content
        blob = new Blob([file.content], { type: file.type || 'text/plain' });
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  }

  // File upload test - Netlify Function: file-upload
  async uploadFiles(files: File[]) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    const response = await this.api.post('/file-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // File download (for speed test)
  async downloadFile(sizeMB: number): Promise<Blob> {
    const response = await this.api.get(`/test/download?size=${sizeMB}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Latency test - Netlify Function: ping
  async pingTest() {
    const startTime = Date.now();
    const response = await this.api.get('/ping');
    const endTime = Date.now();
    return {
      latency: endTime - startTime,
      data: response.data,
    };
  }

  // Health check (for development)
  async healthCheck() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      // In production with Netlify functions, use ping instead
      const response = await this.api.get('/ping');
      return response.data;
    }
  }

  // Helper method to convert base64 to Blob
  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}

export const apiService = new ApiService();
