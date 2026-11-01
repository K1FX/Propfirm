import { expect, test } from "@playwright/test";

test.use({ locale: "fr-FR" });

test("classement public : podium, filtres et bandeau démo", async ({ page }) => {
  await page.goto("/fr/leaderboard");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Les meilleurs");
  await expect(page.getByRole("note")).toContainText("Données de démonstration");
  await expect(page.getByRole("region", { name: "Podium" })).toBeVisible();
  await page.getByRole("button", { name: "50K", exact: true }).click();
  await expect(page.getByRole("button", { name: "50K", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("classement trader : la position de l'utilisateur est visible", async ({ page }) => {
  await page.goto("/fr/dashboard/leaderboard");
  await expect(page.getByText("Trader démo").first()).toBeVisible();
});

// Aucune page ne doit déborder horizontalement sur mobile.
const pages = [
  "/fr",
  "/fr/leaderboard",
  "/fr/styleguide",
  "/fr/dashboard",
  "/fr/dashboard/accounts",
  "/fr/dashboard/accounts/ACC-50K-1042",
  "/fr/dashboard/pass",
  "/fr/dashboard/payouts",
  "/fr/dashboard/leaderboard",
];

for (const path of pages) {
  test(`pas de débordement horizontal : ${path}`, async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile uniquement");
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
