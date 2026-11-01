import { expect, test } from "@playwright/test";

test.use({ locale: "fr-FR" });

test("landing : hero, barre de confiance et sections clés", async ({ page }) => {
  await page.goto("/fr");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Financé jusqu'à");
  await expect(page.getByLabel("Chiffres clés")).toContainText("Profit split");
  await expect(page.getByRole("heading", { name: /Votre premier payout/ })).toBeVisible();
  await expect(page.locator("#plans").getByRole("link", { name: /^Commencer avec/ })).toHaveCount(
    4,
  );
  await expect(page.locator("#plans").getByText("Le plus populaire")).toBeVisible();
  await expect(page.getByRole("contentinfo").getByText(/comptes de trading simulés/)).toBeVisible();
});

test("le CTA principal mène à la section des plans", async ({ page }) => {
  await page.goto("/fr");
  await page.locator("#hero").getByRole("link", { name: "Commencer à trader" }).click();
  await expect(page).toHaveURL(/#plans$/);
  await expect(page.locator("#plans")).toBeInViewport();
});

test("FAQ en accordéon", async ({ page }) => {
  await page.goto("/fr");
  const q = page.getByText("Comment fonctionne l'évaluation ?");
  await q.click();
  await expect(page.getByText(/Rush : une étape, validable dès 1 jour/)).toBeVisible();
});

test("le bandeau promo se masque", async ({ page }) => {
  await page.goto("/fr");
  await page.getByRole("button", { name: "Masquer l'offre" }).click();
  await expect(page.getByRole("button", { name: "Masquer l'offre" })).toHaveCount(0);
});

test("les liens du header ne mènent pas à une 404", async ({ page }) => {
  for (const path of [
    "/fr/challenges",
    "/fr/rules",
    "/fr/pass",
    "/fr/payouts",
    "/fr/faq",
    "/fr/styleguide",
  ]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
  }
});

test("menu mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile uniquement");
  await page.goto("/fr");
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await expect(page.locator("#mobile-menu")).toBeVisible();
  await page.locator("#mobile-menu").getByRole("link", { name: "FAQ" }).click();
  await expect(page).toHaveURL(/\/fr\/faq$/);
  await expect(page.locator("#mobile-menu")).toBeHidden();
});

test("bouton fixe mobile : visible après le hero, masqué sur les plans", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile uniquement");
  await page.goto("/fr");
  const sticky = page.getByRole("link", { name: /Être financé ·/ });
  await expect(sticky).toHaveCount(0);
  await page.locator("#how-it-works").scrollIntoViewIfNeeded();
  await expect(sticky).toBeVisible();
  await page.locator("#plans").scrollIntoViewIfNeeded();
  await expect(sticky).toHaveCount(0);
});
