import { gql } from "graphql-request";
import { client } from "../client";
import { FileUploadTask } from "../types";
import { PAGE_UPDATE_MUTATION } from "../mutations";
import { uploadFileAndGetUrl } from "./upload-file-and-get-url";

export async function uploadPageFileAttributesGeneric(
  pageId: string,
  fileUploads: FileUploadTask[],
): Promise<void> {
  console.log("[SEEDING] Uploading file attributes for homepage...");

  const fileAttributes: {
    id: string;
    file: string;
    contentType: string;
  }[] = [];

  for (const task of fileUploads) {
    for (const url of task.urls) {
      const uploadedUrl = await uploadFileAndGetUrl(url);
      console.log(`[SEEDING] Uploaded file: ${uploadedUrl}`);
      fileAttributes.push({
        id: task.attributeId,
        file: uploadedUrl,
        contentType: "image/jpeg",
      });
    }
  }


  const updateRes = await client.request<{
    pageUpdate: {
      page: { id: string } | null;
      errors: { field: string; message: string }[];
    };
  }>(PAGE_UPDATE_MUTATION, {
    id: pageId,
    input: { attributes: fileAttributes },
  });

  if (updateRes.pageUpdate.errors.length > 0) {
    throw new Error(
      `[SEEDING] Failed to assign file attributes: ${JSON.stringify(updateRes.pageUpdate.errors)}`,
    );
  }

  console.log("[SEEDING] File attributes assigned successfully");
}
