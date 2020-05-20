export class UploadResponse {
    
  constructor(
    public fileName: string,
    public fileDownloadUri: string,
    public fileType: string,
    public size: number,
    
  ) {  }
}
