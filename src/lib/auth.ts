// lib/auth.ts
import { cookies } from "next/headers";

/**
 * Cookie'den token'ı alır
 */
export function getToken(): string | null {
  const cookieStore = cookies();
  const token = cookieStore.get("jwt")?.value;

  return token || null;
}

/**
 * Kullanıcıyı çözümler (JWT'yi decode etmek için basit çözüm)
 * Backend doğrulamasını kullanmak daha güvenlidir.
 */
export function getUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString(),
    );
    return payload;
  } catch {
    return null;
  }
}
