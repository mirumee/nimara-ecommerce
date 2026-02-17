const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL;
const SALEOR_APP_TOKEN = process.env.SALEOR_APP_TOKEN;

/**
 * Uploads a file and gets its URL.
 * @param imageUrl - URL of the image to upload.
 * @returns URL of the uploaded file.
 */
export async function uploadFileAndGetUrl(imageUrl: string): Promise<string> {
  const imageRes = await fetch(imageUrl);
  const buffer = Buffer.from(await imageRes.arrayBuffer());
  const file = new File([buffer], "image.jpg", { type: "image/jpeg" });

  const query = `
    mutation FileUpload($file: Upload!) {
      fileUpload(file: $file) {
        uploadedFile {
          url
          contentType
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const operations = JSON.stringify({
    query,
    variables: { file: null },
  });
  const map = JSON.stringify({ "0": ["variables.file"] });

  const formData = new FormData();
  formData.append("operations", operations);
  formData.append("map", map);
  formData.append("0", file);

  const response = await fetch(SALEOR_API_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${SALEOR_APP_TOKEN}` },
    body: formData,
  });

  const res = await response.json();
  const errors = res.data?.fileUpload?.errors;

  if (errors?.length > 0) {
    throw new Error(`[SEEDING] fileUpload failed: ${JSON.stringify(errors)}`);
  }

  return res.data.fileUpload.uploadedFile.url;
}
