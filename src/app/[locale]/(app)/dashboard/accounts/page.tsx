import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AccountSummaryCard } from "@/components/dashboard/account-summary-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { ButtonLink } from "@/components/ui/button";
import { toLocale } from "@/i18n/routing";
import { listAccounts } from "@/server/accounts/service";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard.nav");
  return { title: t("accounts") };
}

const order = { funded: 0, passed: 1, evaluation: 2, failed: 3, breached: 4 } as const;

export default async function AccountsPage({ params }: PageProps<"/[locale]/dashboard/accounts">) {
  const { locale } = await params;
  setRequestLocale(toLocale(locale));
  const t = await getTranslations("Dashboard.nav");
  const accounts = (await listAccounts()).sort((a, b) => order[a.status] - order[b.status]);

  return (
    <>
      <PageHeader
        title={t("accounts")}
        actions={
          <ButtonLink href="/challenges" size="sm">
            <Plus />
            {t("newChallenge")}
          </ButtonLink>
        }
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((a) => (
          <AccountSummaryCard key={a.id} account={a} />
        ))}
      </div>
    </>
  );
}
