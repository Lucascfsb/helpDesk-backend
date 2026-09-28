import fs from "fs";
import path from "path";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { UPLOAD_CONFIG } from "@/configs/upload";

interface Request {
  userId: string;
  avatarFilename: string;
}

export class UpdateUserAvatarService {
  async execute({ userId, avatarFilename }: Request) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    if (user.avatarUrl) {
      const userAvatarFilePath = path.join(
        UPLOAD_CONFIG.UPLOADS_FOLDER,
        user.avatarUrl,
      );
      try {
        await fs.promises.stat(userAvatarFilePath);
        await fs.promises.unlink(userAvatarFilePath);
      } catch {
        // Arquivo antigo não existia localmente, segue o fluxo
      }
    }

    await fs.promises.rename(
      path.join(UPLOAD_CONFIG.TMP_FOLDER, avatarFilename),
      path.join(UPLOAD_CONFIG.UPLOADS_FOLDER, avatarFilename),
    );

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: avatarFilename },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    return updatedUser;
  }
}
