import Link from "next/link";
import GiftArtwork, { type GiftKind } from "@/components/pair/GiftArtwork";

const GIFTS: { id: GiftKind; title: string; description: string }[] = [
  {
    id: "album",
    title: "Персональный альбом пары",
    description: "Ваши фотографии, воспоминания и важные моменты отношений — в одном особенном альбоме.",
  },
  {
    id: "comic",
    title: "Комикс о вашей истории",
    description: "Знакомство, первые свидания и любимые моменты в комиксе, где главные герои — вы.",
  },
  {
    id: "game",
    title: "Игра для двоих",
    description: "Вопросы, задания и совместные приключения, чтобы узнать друг друга ещё ближе.",
  },
  {
    id: "gum",
    title: "Жвачки для пар",
    description: "Маленький необычный подарок с забавными посланиями, понятными только вам двоим.",
  },
  {
    id: "capsule",
    title: "Капсула воспоминаний",
    description: "Коллекция ваших моментов в цифровой или физической капсуле. Сохраните сейчас, откройте вместе в будущем.",
  },
  {
    id: "dates",
    title: "Наши 100 свиданий",
    description: "Персональный набор идей для времени вдвоём — от уютных вечеров до маленьких приключений.",
  },
];

export default function GiftsScreen() {
  return (
    <div className="theme-screen">
      <nav aria-label="Навигация маркетплейса" className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
        <Link href="/" aria-label="Вернуться на главную" className="theme-icon-button flex h-11 w-11 items-center justify-center rounded-full border text-[20px]">
          <span aria-hidden="true">←</span>
        </Link>
        <div className="min-w-0 text-center text-[14px] font-semibold leading-snug">Маркетплейс подарков</div>
        <div aria-hidden="true" />
      </nav>

      <header className="theme-reveal mt-7">
        <h1 className="text-[30px] font-extrabold leading-[1.12] tracking-[-0.04em]">Подарки, которые запоминаются</h1>
        <p className="theme-subtle-text mt-3 text-[14px] leading-relaxed">Особенные вещи для вашей истории</p>
        <p className="theme-muted-text mt-3 text-[12px] leading-relaxed">Демонстрационный каталог. Мы готовим эти подарки для вас — пока они недоступны для заказа.</p>
      </header>

      <section aria-label="Коллекция подарков для пары" className="theme-reveal theme-reveal-delay-1 mt-6 grid gap-4">
        {GIFTS.map((gift) => (
          <article key={gift.id} aria-labelledby={`gift-${gift.id}`} className="theme-widget-card theme-surface-lift relative overflow-hidden rounded-[32px] border p-4">
            <div className="theme-panel-section relative flex h-40 items-center justify-center rounded-[24px]">
              <GiftArtwork kind={gift.id} />
              <span className="theme-chip absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold">Скоро</span>
            </div>
            <h2 id={`gift-${gift.id}`} className="mt-4 text-[19px] font-extrabold leading-tight tracking-[-0.025em]">{gift.title}</h2>
            <p className="theme-muted-text mt-2 text-[13px] leading-relaxed">{gift.description}</p>
          </article>
        ))}
      </section>

      <Link href="/" className="theme-option-card mt-6 flex min-h-12 items-center justify-center rounded-[24px] border px-4 py-3 text-center text-[14px] font-semibold">
        Вернуться к вашей истории
      </Link>
      <div className="h-10" />
    </div>
  );
}
