import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function createClient() {
  const cookieStore = await cookies();
  const rawDemo = cookieStore.get("demo_session")?.value;
  const demoEmail = rawDemo ? decodeURIComponent(rawDemo) : undefined;

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component; middleware will refresh the session.
          }
        },
      },
    },
  );

  if (demoEmail) {
    const originalGetUser = client.auth.getUser.bind(client.auth);
    client.auth.getUser = async (jwt?: string) => {
      try {
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            demoEmail,
          );
        const dbUser = await prisma.user.findFirst({
          where: isUuid
            ? { OR: [{ id: demoEmail }, { email: demoEmail }] }
            : { email: demoEmail },
        });
        if (dbUser) {
          return {
            data: {
              user: {
                id: dbUser.id,
                app_metadata: { role: dbUser.role },
                user_metadata: {
                  role: dbUser.role,
                  full_name: dbUser.name,
                  name: dbUser.name,
                },
                aud: "authenticated",
                confirmation_sent_at: "",
                recovery_sent_at: "",
                email_change_sent_at: "",
                new_email: "",
                invited_at: "",
                action_link: "",
                email: dbUser.email,
                phone: "",
                created_at: dbUser.created_at.toISOString(),
                confirmed_at: dbUser.created_at.toISOString(),
                email_confirmed_at: dbUser.created_at.toISOString(),
                phone_confirmed_at: "",
                last_sign_in_at: new Date().toISOString(),
                role: "authenticated",
                updated_at: dbUser.updated_at.toISOString(),
                identities: [],
                is_anonymous: false,
              } as any,
            },
            error: null,
          };
        }
      } catch (err) {
        console.error("Error retrieving demo user in createClient:", err);
      }
      return originalGetUser(jwt);
    };
  }

  return client;
}
