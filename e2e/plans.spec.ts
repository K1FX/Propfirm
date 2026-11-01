import { expect, test } from "@playwright/test";

test.use({ locale: "fr-FR" });

test.beforeEach(async ({ page }) => {
  await page.goto("/fr#plans");
});

test("onglets Rush / Flex / Instant", async ({ page }) => {
  const plans = page.locator("#plans");
  await expect(plans.getByRole("tab", { name: /Rush/ })).toHaveAttribute("aria-selected", "true");
  await expect(plans.getByRole("heading", { name: "Évaluation 50K" })).toBeVisible();

  await plans.getByRole("tab", { name: /Instant/ }).click();
  await expect(plans.getByRole("heading", { name: "Financé 50K" })).toBeVisible();
  await expect(plans.getByRole("link", { name: "Être financé avec 50K" })).toBeVisible();
  // Pas de Pay Later sur Instant
  await expect(plans.getByRole("radio", { name: "Pay Later" })).toHaveCount(0);
});

test("prix remisés et économie affichée (code -40 %)", async ({ page }) => {
  const card = page.locator("#plans article[data-size='50k']");
  await expect(card).toContainText("77"); // 129 $ → 77 $
  await expect(card).toContainText("Économisez 52");
});

test("Pay Later : prix du jour + activation, sans code promo", async ({ page }) => {
  const plans = page.locator("#plans");
  await plans.getByRole("radio", { name: "Pay Later" }).click();
  const card = plans.locator("article[data-size='50k']");
  await expect(card).toContainText("59");
  await expect(card).toContainText("après réussite");
  await expect(card).toContainText("Non cumulable avec les codes promo");
});

test("les règles Funded s'ouvrent dans une fenêtre", async ({ page }) => {
  const plans = page.locator("#plans");
  await plans
    .locator("article[data-size='50k']")
    .getByRole("button", { name: "Voir les règles Funded" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Tous les 5 jours gagnants");
  await expect(dialog).toContainText("2 000");
  await dialog.getByRole("button", { name: "Fermer" }).click();
  await expect(dialog).toBeHidden();
});

test("infobulle « ? » sur la perte journalière", async ({ page }) => {
  const card = page.locator("#plans article[data-size='50k']");
  await card.getByRole("button", { name: "Perte journalière max." }).focus();
  await expect(page.getByRole("tooltip")).toContainText("n'est PAS perdu");
});
