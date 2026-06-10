import Link from "next/link";
import { useTranslations } from "next-intl";

type FooterNamespace = "result" | "stats";

export function SiteFooter({ namespace }: { namespace: FooterNamespace }) {
  const t = useTranslations(namespace);

  return (
    <footer className="flex flex-col items-center gap-2 pt-4 text-xs text-muted-foreground">
      <div className="flex items-center justify-center gap-3">
        <span>Cortex &copy; </span>
        <a
          href="https://academic.jyunko.cn"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-foreground hover:underline underline-offset-4"
        >
          {t("author")}
        </a>
        <span className="text-muted-foreground/40">|</span>
        <Link
          href="/about"
          className="transition-colors hover:text-foreground hover:underline underline-offset-4"
        >
          {t("aboutLink")}
        </Link>
      </div>
      <div className="flex items-center justify-center gap-3">
        <a
          href="https://deadpan.hydroroll.team"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-foreground hover:underline underline-offset-4"
        >
          {t("otherGame")}
        </a>
        <span className="text-muted-foreground/40">|</span>
        <a
          href="https://lcti.hydroroll.team"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-foreground hover:underline underline-offset-4"
        >
          {t("otherXingce")}
        </a>
        <span className="text-muted-foreground/40">|</span>
        <a
          href="https://ddlroast.hydroroll.team"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-foreground hover:underline underline-offset-4"
        >
          {t("ddlRoast")}
        </a>
      </div>
    </footer>
  );
}
