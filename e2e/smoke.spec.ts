import { expect, test } from "@playwright/test";

test.describe("navigateur francophone", () => {
  test.use({ locale: "fr-FR" });

  test("la racine redirige vers /fr", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/fr$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("navigateur anglophone", () => {
  test.use({ locale: "en-US" });

  test("la racine redirige vers /en", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
  });
});

test("la version anglaise est servie sur /en", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Trade futures");
});

test("les espaces trader et admin répondent", async ({ page }) => {
  for (const path of ["/fr/dashboard", "/fr/admin"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
  }
});
