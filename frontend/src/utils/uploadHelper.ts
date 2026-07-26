/**
 * Uploads a file (image/document) to Google Drive via the Google Apps Script Web App.
 * If VITE_GOOGLE_SCRIPT_URL is not configured in the environment, it falls back to
 * generating a local mock URL for demonstration/testing.
 */
export interface UploadResult {
  image_url: string;
  file_id: string;
}

export const uploadImageToDrive = async (file: File): Promise<UploadResult> => {
  const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    console.warn(
      "VITE_GOOGLE_SCRIPT_URL is not defined. Falling back to local Mock Upload."
    );
    // Simulate web delay and return base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve({
          image_url: reader.result as string,
          file_id: "mock-google-drive-id-" + Math.random().toString(36).substring(2, 9),
        });
      };
      reader.onerror = (error) => {
        reject(new Error("Lỗi đọc tệp tin mock: " + error));
      };
    });
  }

  // Convert file to Base64 to POST to Apps Script Web App
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Content = (reader.result as string).split(",")[1];
        const response = await fetch(scriptUrl, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileData: base64Content,
            fileName: file.name,
            mimeType: file.type,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === "success" || data.image_url) {
          resolve({
            image_url: data.image_url,
            file_id: data.file_id || data.fileId || "unknown-drive-id",
          });
        } else {
          reject(new Error(data.message || "Tải lên Google Drive thất bại."));
        }
      } catch (error: any) {
        reject(new Error("Lỗi khi tải ảnh lên Google Apps Script: " + error.message));
      }
    };
    reader.onerror = (error) => {
      reject(new Error("Lỗi đọc tệp tin: " + error));
    };
  });
};
