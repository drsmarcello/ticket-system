export const UPLOAD_ATTACHMENT = `
  mutation UploadAttachment($file: Upload!, $data: AttachmentUploadInput!) {
    uploadAttachment(file: $file, data: $data) {
      id
      filename
      mimeType
      size
      url
      createdAt
      uploadedBy {
        name
      }
    }
  }
`;

export const DELETE_ATTACHMENT = `
  mutation DeleteAttachment($id: ID!) {
    deleteAttachment(id: $id) {
      id
      filename
    }
  }
`;
