import { AccountPass } from "@/components/ui/account-pass";

type Props = { evalLabel: string; fundedLabel: string; subtitle: string };

/** Les deux billets « Aurum Pass » du hero (150K évaluation + 50K financé), animés en CSS. */
export function HeroCards({ evalLabel, fundedLabel, subtitle }: Props) {
  return (
    <div className="relative mx-auto h-[400px] w-full max-w-[480px] sm:h-[480px]" aria-hidden>
      <div className="absolute top-1/2 left-1/2 size-[420px] -translate-1/2 rounded-full bg-cyan/15 blur-[100px]" />
      <div className="absolute top-0 left-[4%] w-[46%] -rotate-[8deg] animate-rise-in">
        <div className="animate-float">
          <AccountPass
            variant="evaluation"
            size="150K"
            status={evalLabel}
            subtitle={subtitle}
            serial="AF-150K-0001"
          />
        </div>
      </div>
      <div className="absolute right-[4%] bottom-0 w-[46%] rotate-[7deg] animate-rise-in [animation-delay:150ms]">
        <div className="animate-float [animation-delay:1.5s]">
          <AccountPass
            variant="funded"
            size="50K"
            status={fundedLabel}
            subtitle={subtitle}
            serial="AF-50K-0002"
          />
        </div>
      </div>
    </div>
  );
}
