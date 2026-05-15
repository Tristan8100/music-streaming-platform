import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      //cloudinary_url: process.env.CLOUDINARY_URL,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} storage`;
  }

  async upload(
    bucket: string, // kept for legacy compatibility (ignored in Cloudinary)
    path: string,
    file: Express.Multer.File,
  ) {
    try {
      const publicId = path; // preserve your "local_path concept"

      const result: UploadApiResponse = await new Promise(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: publicId,
              folder: bucket, // maps Supabase bucket → Cloudinary folder
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result as UploadApiResponse);
            },
          );

          stream.end(file.buffer);
        },
      );

      return {
        path: result.secure_url,     // SAME AS OLD "path"
        local_path: result.public_id, // SAME AS OLD "local_path"
      };
    } catch (error : any) {
      console.log(error);
      throw new InternalServerErrorException(
        error?.message || 'Cloudinary upload failed',
      );
    }
  }

  async delete(bucket: string, path: string) {
    try {
      const result = await cloudinary.uploader.destroy(path, {
        resource_type: 'video',
      });

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Failed to delete: ${result.result}`);
      }

      return result;
    } catch (error : any) {
      throw new InternalServerErrorException(
        error?.message || 'Cloudinary delete failed',
      );
    }
  }
}


// LEGACY CODE
// import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import { createClient, SupabaseClient } from '@supabase/supabase-js';

// @Injectable()
// export class StorageService {
//   private client: SupabaseClient;

//   constructor() {
//     this.client = createClient(
//       process.env.SUPABASE_URL as string,
//       process.env.SUPABASE_KEY as string,
//     );
//   }
  
//   remove(id: number) {
//     return `This action removes a #${id} storage`;
//   }

//   async upload(
//     bucket: string,
//     path: string,
//     file: Express.Multer.File,
//   ) {
//     const { data, error } = await this.client.storage
//       .from(bucket)
//       .upload(path, file.buffer, {
//         contentType: file.mimetype,
//       });

//     if (error) {
//       console.log(error);
//       throw new InternalServerErrorException(error.message);
//     }

//     const { data : actual_url } = this.client.storage //duplicate data needs to deserialized
//       .from(bucket)
//       .getPublicUrl(data?.path as string);

//     return {
//       path: actual_url.publicUrl,
//       local_path: data.path,
//     };
//   }

//   //const upload = ...function
//   //return { upload.path, full url
//   //         upload.data, }

//   async delete(bucket: string, path: string) {
//     console.log('Deleting file at path:', path);
//     const { error, data } = await this.client.storage
//       .from(bucket)
//       .remove([path]);

//     if (error) {
//       throw new InternalServerErrorException(error.message);
//     }

//     return data;
//   }
// }
