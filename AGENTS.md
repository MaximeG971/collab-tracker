# AGENTS.md — Collab Tracker

Contexte projet pour les assistants IA (Cursor, etc.) travaillant sur ce dépôt.

## Vue d'ensemble

Webapp PWA mobile-first permettant aux créateurs de contenu de centraliser et gérer leurs collaborations avec les marques (remplace Notes/Calendrier/mails dispersés). Première utilisatrice de test : Cassy.

Philosophie produit : simple, rapide, visuel, agréable sur mobile. La V1 doit répondre à 3 questions :

- **Liste** → Quelles collaborations ai-je ?
- **Kanban** → Où en sont-elles ?
- **Calendrier** → Quand dois-je faire quoi ?

Ne pas complexifier prématurément (pas de finances/stats/IA en V1 — voir roadmap plus bas).

## Stack technique

- **Framework** : Nuxt 4 / Vue 3
- **Style** : Tailwind CSS (utility classes uniquement, pas de CSS custom sauf nécessité)
- **Backend / BDD** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth (email/mot de passe). Phase de test actuelle : comptes créés uniquement par l'admin, inscription publique désactivée. Pourra être réouverte plus tard (bascule de config, pas de dev).
- **Storage** : Supabase Storage, bucket `collaboration-files` (privé, policies RLS)
- **Package manager** : pnpm (jamais npm/yarn)
- **Types DB** : générés via `supabase gen types typescript` → `~/types/database.types.ts`

## Modèle de données (Supabase)

Tables : `brands`, `collaborations`, `deliverables`, `tasks`, `files` — toutes protégées par Row Level Security (RLS), isolation stricte par `user_id`.

Point clé : **le statut vit au niveau `deliverable`, pas `collaboration`**. Une collaboration peut avoir plusieurs livrables (ex: Reel + TikTok + 3 Stories), chacun avec son propre statut et sa propre deadline.

Le statut affiché d'une collaboration est **calculé, jamais stocké** : c'est le statut le moins avancé parmi ses livrables (vue SQL `collaborations_with_status`, colonnes `computed_status` et `is_late`). Toujours interroger cette vue côté front pour le Kanban/Liste, pas la table `collaborations` brute.

Enum de statut (ordre d'avancement) :
`to_contact → validated → product_received → to_create → to_validate → scheduled → published`

`is_late` = un livrable a une `deadline_date` dépassée et n'est pas encore `published`. Calculé à la volée, jamais stocké.

## Conventions de code

- TypeScript strict partout
- Composants bien séparés, pas de logique métier dans les composants — passer par des composables (`useCollaborations`, `useDeliverables`, etc.)
- Jamais de clé Supabase `service_role` côté client — uniquement l'`anon` key (protégée par la RLS)
- Chemins de fichiers Storage : toujours préfixés par `{user_id}/{collaboration_id}/{file_name}` (requis par les policies RLS du bucket)
- Pas de code mort, pas de clé/valeur en dur — tout ce qui peut varier (URLs, clés) passe par `.env` / `runtimeConfig`

## Git

Workflow : `main ← develop ← feature/*`

- `main` : production uniquement
- `develop` : intégration
- `feature/nom-de-la-feature` : une branche par fonctionnalité, mergée dans `develop` via PR

## Roadmap (ne pas anticiper dans le code V1)

- **V2** : finances (montants prévus/facturés/payés, CA), rappels/notifications, templates de workflow, statistiques post-publication
- **V3** : IA — analyse automatique de briefs, assistant conversationnel
- **V4+** : produit commercial multi-utilisateurs (plans Free/Pro, facturation, intégrations)

Ne pas construire de code générique "pour anticiper" ces versions — la BDD est déjà pensée pour évoluer proprement (relations propres, vue calculée), mais l'UI et la logique restent volontairement simples tant que ces besoins ne sont pas réels.
