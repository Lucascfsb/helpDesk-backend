import path from "node:path";
import fs from "node:fs";
import { prisma } from "@/database/prisma";
import { UPLOAD_CONFIG } from "@/configs/upload";
import { AppError } from "@/utils/AppError";

interface Request {
  userId: string;
  avatarFilename: string;
}

export class UpdateUserAvatarService {
  async execute({ userId, avatarFilename }: Request) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    if (user.avatarUrl) {
      const userAvatarFilePath = path.resolve(
        UPLOAD_CONFIG.UPLOADS_FOLDER,
        user.avatarUrl,
      );

      try {
        await fs.promises.stat(userAvatarFilePath);
        await fs.promises.unlink(userAvatarFilePath);
      } catch {}
    }

    const tmpFilePath = path.resolve(UPLOAD_CONFIG.TMP_FOLDER, avatarFilename);
    const destFilePath = path.resolve(
      UPLOAD_CONFIG.UPLOADS_FOLDER,
      avatarFilename,
    );

    await fs.promises.rename(tmpFilePath, destFilePath);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: avatarFilename,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
