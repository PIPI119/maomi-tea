import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // === 1. ЗАХИСТ АДМІНКИ (BASIC AUTH) ===
  // Перевіряємо, чи йде запит на сторінки адмінки
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = request.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // Перевіряємо логін (maomi) і пароль (з твого .env.local)
      if (user !== 'maomi' || pwd !== process.env.ADMIN_PASSWORD) {
        return new NextResponse('Доступ заборонено', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
          },
        });
      }
    } else {
      // Якщо пароля немає взагалі — викидаємо вікно вводу
      return new NextResponse('Доступ заборонено', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
        },
      });
    }
  }

  // === 2. ТВІЙ ОРИГІНАЛЬНИЙ КОД SUPABASE ===
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}

// Залишаємо твій оригінальний matcher
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};