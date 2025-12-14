import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_KEY as string,
    );
  }
  
  remove(id: number) {
    return `This action removes a #${id} storage`;
  }

  async upload(
    bucket: string,
    path: string,
    file: Express.Multer.File,
  ) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
      });

    const { data : publicUrl } = this.client.storage //duplicate data needs to deserialized
      .from(bucket)
      .getPublicUrl(data?.path as string);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      path: publicUrl,
      data};
  }

  async delete(bucket: string, path: string) {

    const { error, data } = await this.client.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
