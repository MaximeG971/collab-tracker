export default defineNuxtConfig({
  compatibilityDate: "2026-09-04",
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase", "@nuxtjs/tailwindcss"],
  supabase: {
    redirect: false,
  },
});
