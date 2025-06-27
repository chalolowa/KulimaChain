import lighthouse from "@lighthouse-web3/sdk";

const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY as string;

interface UploadResponse {
  cid: string;
  status: string;
  fileName?: string;
  error?: string;
}

export interface UploadResult {
  [fileName: string]: {
    cid: string;
    status: string;
    error?: string;
  };
}

export async function uploadFiles(
  files: File[], 
  publicKey: string
): Promise<UploadResult> {
  const results: UploadResult = {};
  
  try {
    // Upload files with encryption
    const signedMessage = "";

    for (const file of files) {
      try {
        const output = await lighthouse.uploadEncrypted(
          file,
          LIGHTHOUSE_API_KEY,
          publicKey,
          signedMessage
        );
        
        results[file.name] = {
          cid: output.data[0].Hash,
          status: 'pending'
        };
      } catch (error) {
        console.error(`Lighthouse upload error for ${file.name}:`, error);
        results[file.name] = {
          cid: '',
          status: 'error',
          error: (error as Error).message
        };
      }
    }
    
    return results;
  } catch (error) {
    console.error('Global Lighthouse upload error:', error);
    throw new Error('Failed to upload files to Lighthouse');
  }
}

export async function grantAccess(
  cids: string[], 
  publicKey: string, 
  conditions: string = ""
): Promise<any> {
  try {
    const response = await lighthouse.shareFile(
      publicKey,
      cids,
      LIGHTHOUSE_API_KEY,
      conditions
    );
    
    return response.data;
  } catch (error) {
    console.error('Lighthouse access grant error:', error);
    throw new Error('Failed to grant file access');
  }
}

export async function decryptFile(cid: string, privateKey: string): Promise<Blob> {
  try {
    // Fetch and decrypt file
    const decrypted = await lighthouse.decryptFile(cid, privateKey);
    return decrypted;
  } catch (error) {
    console.error('Lighthouse decrypt error:', error);
    throw new Error('Failed to decrypt file');
  }
}