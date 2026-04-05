import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // === 1. ЗАХИСТ АДМІНКИ (BASIC AUTH) ===
  if (pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');
    
    // Якщо .env не бачить пароль, використовуємо цей як запасний
    const expectedPassword = process.env.ADMIN_PASSWORD || 'maomi1maomi2';

    if (!authHeader) {
      return new NextResponse('Auth Required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin"' },
      });
    }

    try {
      const auth = authHeader.split(' ')[1];
      const decoded = atob(auth);
      const [user, pwd] = decoded.split(':');

      if (user !== 'maomi' || pwd !== expectedPassword) {
        return new NextResponse('Unauthorized', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin"' },
        });
      }
      // Якщо пароль вірний — код просто іде далі до секції Supabase
    } catch (e) {
      return new NextResponse('Auth Error', { status: 401 });
    }
  }

  // === 2. КОД SUPABASE (ОБОВ'ЯЗКОВО ДЛЯ ВСІХ СТОРІНОК) ===
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

  // Оновлюємо сесію (важливо для Supabase)
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};