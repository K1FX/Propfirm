import { expect, test } from "@playwright/test";

test.use({ locale: "fr-FR" });

test("la page d'accueil affiche les sections clés", async ({ page }) => {
  await page.goto("/fr");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Tradez les futures");
  for (const size of ["25K", "50K", "100K", "150K"]) {
    await expect(page.getByRole("link", { name: `Commencer le ${size}` })).toBeVisible();
  }
  await expect(page.getByText("Recommandé")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Financé en 3 étapes" })).toBeVisible();
  await expect(page.getByText(/comptes de trading simulés/).first()).toBeVisible();
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
