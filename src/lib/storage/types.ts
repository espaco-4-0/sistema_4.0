export type UploadResult = {
    path: string;
    url?: string;
};

export interface StorageProvider {
    uploadPublic(file: File | Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
    uploadPrivate(file: File | Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
    getPrivateUrl(path: string, expiresInSeconds?: number): Promise<string>;
    delete(path: string, isPrivate?: boolean): Promise<void>;
}
