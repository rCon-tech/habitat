import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Crest } from '@/components/Crest';
import { HabitatCard } from '@/components/HabitatCard';
import { Logo } from '@/components/Logo';
import { Pieces } from '@/components/landing/Pieces';
import { SiteHeader } from '@/components/SiteHeader';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/current-user';
import { listMyHabitats } from '@/lib/habitats';

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) return <Landing />;
  if (!user.onboardedAt) redirect('/onboarding');
  const habitats = await listMyHabitats(user.id);

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        <h1 className="text-4xl font-extrabold sm:text-5xl">Your Habitats</h1>
        <p className="mt-2 text-ink-soft">Each one is a private home for a group of friends.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {habitats.map((h) => (
            <HabitatCard key={h.id} h={h} />
          ))}
          <Link
            href="/new"
            className="group flex min-h-52 flex-col items-center justify-center gap-3 rounded-[1.75rem] border-2 border-dashed border-line p-4 text-ink-soft transition hover:border-accent hover:text-ink"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-t-full rounded-b-2xl bg-surface-2 transition group-hover:bg-accent group-hover:text-accent-ink">
              <Plus size={26} />
            </span>
            <span className="font-display text-lg font-extrabold">New Habitat</span>
          </Link>
        </div>
        {habitats.length === 0 && (
          <p className="mt-6 text-sm text-ink-soft">
            Got an invite link? Open it and you’ll land in your friends’ Habitat.
          </p>
        )}
      </main>
    </>
  );
}

function Landing() {
  const steps = [
    {
      n: '01',
      title: 'Private by default',
      text: 'No public profiles, no search, no strangers. Only the people you invite can see anything. There are no ads and no algorithm.',
    },
    {
      n: '02',
      title: 'Built from pieces',
      text: 'Start with a feed, photos, events and chat. Add polls, birthdays, shared costs and more from the library, or have one made for you.',
    },
    {
      n: '03',
      title: 'Decided together',
      text: 'Anyone can suggest a new piece. The group votes, and it appears for everyone. Nobody is the boss of your Habitat except you all.',
    },
  ];
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-nav text-nav-ink">
        <Crest
          seed="habitat-landing"
          cols={24}
          rows={12}
          density={0.5}
          className="absolute inset-0 -z-10 h-full w-full opacity-[0.10]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-nav via-nav/70 to-transparent lg:via-nav/55" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-nav" />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Logo className="text-nav-ink" />
          <Button
            asChild
            variant="outline"
            className="border-white/25 text-nav-ink hover:border-white/60 hover:bg-white/10"
          >
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-5 pb-20 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-16">
          <div className="animate-rise">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden /> A private home for you
              and your people
            </p>
            <h1 className="text-[clamp(3rem,7.4vw,5.6rem)] leading-[0.94] tracking-[-0.045em]">
              <span className="block whitespace-nowrap">Your friends.</span>
              <span className="block whitespace-nowrap">Your rules.</span>
              <span className="block whitespace-nowrap text-accent">Your place.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-nav-soft">
              Habitat is a small social network that belongs to one group. You choose what’s in it,
              together, and change it whenever you like.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/login">Start your Habitat</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-nav-ink hover:bg-white/10">
                <a href="#how">How it works</a>
              </Button>
            </div>
          </div>
          <Pieces />
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="max-w-2xl text-4xl font-extrabold sm:text-5xl">
          Not a feed to scroll. A place that’s yours.
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="border-t-4 border-ink pt-5">
              <span className="font-display text-6xl font-extrabold text-accent">{s.n}</span>
              <h3 className="mt-3 text-2xl font-extrabold">{s.title}</h3>
              <p className="mt-2 text-ink-soft">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-nav text-nav-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-4xl font-extrabold sm:text-5xl">Make it yours.</h2>
            <p className="mt-2 text-nav-soft">It takes a minute, and it’s free to start.</p>
          </div>
          <Button asChild size="lg">
            <Link href="/login">Start your Habitat</Link>
          </Button>
        </div>
        <div className="border-t border-nav-line">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-sm text-nav-soft">
            <Logo size="sm" className="text-nav-ink" />
            <span>No ads. No algorithm. No selling your friends’ photos.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
