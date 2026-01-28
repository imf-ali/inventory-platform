import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { uploadApi } from '@inventory-platform/api';
import type { UploadStatus } from '@inventory-platform/types';
import styles from './m.upload.module.css';

export function meta() {
  return [
    { title: 'Upload Invoice - StockKart' },
    {
      name: 'description',
      content: 'Upload invoice image from mobile device',
    },
  ];
}

export default function MobileUploadPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<UploadStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('No upload token provided');
        setIsValidating(false);
        return;
      }

      try {
        const response = await uploadApi.validateUploadToken(token);
        setTokenStatus(response.status);

        // Token is valid if status is PENDING (ready for upload)
        // Other statuses indicate the token is in use, expired, or failed
        if (response.status === 'PENDING') {
          setIsValid(true);
          setError(null);
        } else if (response.status === 'EXPIRED') {
          setError(
            response.errorMessage ||
              'Upload token has expired. Please scan the QR code again.'
          );
          setIsValid(false);
        } else if (response.status === 'FAILED') {
          setError(
            response.errorMessage ||
              'Upload token is invalid or has failed. Please scan the QR code again.'
          );
          setIsValid(false);
        } else if (response.status === 'COMPLETED') {
          setError(
            'This upload token has already been used. Please scan the QR code again for a new upload.'
          );
          setIsValid(false);
        } else {
          // UPLOADING or PROCESSING - token is in use
          setError(
            'This upload token is currently in use. Please wait for it to complete or scan a new QR code.'
          );
          setIsValid(false);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to validate upload token';
        setError(errorMessage);
        setIsValid(false);
        setTokenStatus(null);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const compressImage = async (
    file: File,
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.7,
    maxFileSizeMB = 2
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressWithQuality = (currentQuality: number): void => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'));
                  return;
                }
                const fileSizeMB = blob.size / (1024 * 1024);
                if (fileSizeMB > maxFileSizeMB && currentQuality > 0.3) {
                  compressWithQuality(Math.max(0.3, currentQuality - 0.1));
                  return;
                }
                resolve(
                  new File([blob], file.name, {
                    type: file.type,
                    lastModified: Date.now(),
                  })
                );
              },
              file.type,
              currentQuality
            );
          };
          compressWithQuality(quality);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !token) {
      setError('Please select an image file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const compressedFile = await compressImage(selectedFile);
      await uploadApi.uploadImage(token, compressedFile);
      setUploadSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to upload image. Please try again.';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.setAttribute('accept', 'image/*');
      fileInputRef.current.click();
    }
  };

  if (isValidating) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Validating upload token...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValid || !token) {
    const getStatusMessage = () => {
      if (tokenStatus === 'EXPIRED') {
        return 'This upload token has expired.';
      } else if (tokenStatus === 'FAILED') {
        return 'This upload token has failed.';
      } else if (tokenStatus === 'COMPLETED') {
        return 'This upload token has already been used.';
      } else if (tokenStatus === 'UPLOADING' || tokenStatus === 'PROCESSING') {
        return 'This upload token is currently in use.';
      }
      return 'Invalid upload token.';
    };

    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>❌</div>
            <h1>Upload Unavailable</h1>
            <p className={styles.errorMessage}>
              {error || getStatusMessage()}
            </p>
            {tokenStatus && (
              <p className={styles.statusInfo}>
                Status: <strong>{tokenStatus}</strong>
              </p>
            )}
            <p className={styles.helpText}>
              Please scan the QR code again to get a new upload link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>📄 Upload Invoice</h1>
          <p className={styles.subtitle}>
            Select an image file or take a photo of your invoice
          </p>
        </div>

        {uploadSuccess && (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✅</div>
            <p>Image uploaded successfully! Processing...</p>
            <p className={styles.successSubtext}>
              You can close this page. The desktop application will receive the
              parsed data.
            </p>
          </div>
        )}

        {error && !uploadSuccess && (
          <div className={styles.errorMessage}>{error}</div>
        )}

        {!uploadSuccess && (
          <div className={styles.uploadSection}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className={styles.fileInput}
              id="invoice-upload"
              disabled={isUploading}
            />

            {selectedFile ? (
              <div className={styles.filePreview}>
                <div className={styles.fileInfo}>
                  <span className={styles.fileIcon}>📄</span>
                  <div className={styles.fileDetails}>
                    <span className={styles.fileName}>{selectedFile.name}</span>
                    <span className={styles.fileSize}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                {selectedFile.type.startsWith('image/') && (
                  <div className={styles.imagePreview}>
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className={styles.previewImage}
                    />
                  </div>
                )}
                <div className={styles.uploadActions}>
                  <button
                    type="button"
                    className={styles.uploadBtn}
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <span className={styles.spinnerSmall}></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        Upload Image
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className={styles.changeFileBtn}
                    onClick={() => {
                      setSelectedFile(null);
                      setError(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    disabled={isUploading}
                  >
                    Change File
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.uploadOptions}>
                <label htmlFor="invoice-upload" className={styles.uploadLabel}>
                  <div className={styles.uploadIcon}>📁</div>
                  <span>Choose from Gallery</span>
                </label>
                <button
                  type="button"
                  className={styles.cameraBtn}
                  onClick={handleCameraCapture}
                  disabled={isUploading}
                >
                  <span className={styles.cameraIcon}>📷</span>
                  <span>Take Photo</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
