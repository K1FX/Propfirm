import { expect, test } from "@playwright/test";

test.use({ locale: "fr-FR" });

test("vue d'ensemble : comptes, alerte et mode démo", async ({ page }) => {
  await page.goto("/fr/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Bonjour");
  await expect(page.getByRole("note")).toContainText("Mode démonstration");
  await expect(page.getByText("ACC-150K-2071 : 81", { exact: false }).first()).toBeVisible();
});

test("page compte : graphique, règles et trades", async ({ page }) => {
  await page.goto("/fr/dashboard/accounts/ACC-50K-1042");
  await expect(page.getByRole("heading", { name: "Règles du compte" })).toBeVisible();
  await expect(page.getByRole("figure", { name: /Évolution du solde/ })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
});

test("compte éliminé : message explicite", async ({ page }) => {
  await page.goto("/fr/dashboard/accounts/ACC-25K-0377");
  await expect(page.getByText(/Compte éliminé le/)).toBeVisible();
});

test("Pass : réclamer un palier", async ({ page }) => {
  await page.goto("/fr/dashboard/pass");
  const claim = page.getByRole("button", { name: "Réclamer" });
  await expect(claim).toHaveCount(1);
  await claim.click();
  await expect(page.getByRole("button", { name: "Réclamer" })).toHaveCount(0);
});

test("compte inconnu → page introuvable", async ({ page }) => {
  // Avec Cache Components, la 1re visite d'un paramètre non listé peut répondre 200 (shell
  // statique) avant d'afficher la page 404 : on vérifie donc ce que voit l'utilisateur.
  await page.goto("/fr/dashboard/accounts/NOPE");
  await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
});
