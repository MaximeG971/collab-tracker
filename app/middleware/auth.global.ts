export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  const publicPages = ["/login", "/register"];
  const isPublicPage = publicPages.includes(to.path);

  // Pas connecté et page protégée → redirection login
  if (!user.value && !isPublicPage) {
    return navigateTo("/login");
  }

  // Déjà connecté et sur login/register → redirection dashboard
  if (user.value && isPublicPage) {
    return navigateTo("/");
  }
});
