import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url("DATABASE_URL must be a valid URL"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET must be a non-empty string"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  const formattedErrors = _env.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  console.error(`Variáveis de ambiente inválidas:\n${formattedErrors}`);
  throw new Error("Variáveis de ambiente inválidas.");
}

export const env = _env.data;
