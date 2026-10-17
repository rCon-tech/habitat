import { WidgetBrowser } from '@/components/WidgetBrowser';
import { getDb } from '@/db';
import { requireUser } from '@/lib/current-user';
import { listActive } from '@/lib/installed-modules';
import { openProposalsByModule } from '@/lib/proposals';
import { requireMemberBySlug } from '@/lib/session';
import { listWidgets } from '@/modules/registry';

export const metadata = { title: 'Widgets' };

export default async function WidgetsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser({ next: `/h/${slug}/widgets` });
  const { ctx } = await requireMemberBySlug(getDb(), slug, user.id);
  const installed = new Set((await listActive(getDb(), ctx.habitatId)).map((a) => a.manifest.id));
  const open = await openProposalsByModule(ctx);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-4xl font-extrabold">Widgets</h1>
        <p className="mt-1 text-ink-soft">
          The pieces your Habitat is built from. Add the ones you want, and take away the ones you
          don’t.
        </p>
      </div>
      <WidgetBrowser
        slug={slug}
        widgets={listWidgets().map((m) => ({
          id: m.id,
          name: m.name,
          tagline: m.tagline,
          description: m.description,
          icon: m.icon,
          category: m.category,
          installed: installed.has(m.id),
          voteOpen: open.get(m.id)
            ? { yes: open.get(m.id)!.yes, memberCount: open.get(m.id)!.memberCount }
            : null,
        }))}
      />
    </div>
  );
}
