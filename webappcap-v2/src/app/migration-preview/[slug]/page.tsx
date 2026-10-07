import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { readSheetsPublishedSiteBySlug } from '@/core/sheets-published-site';
import { renderTemplate } from '@/templates/registry';

export const dynamic = 'force-dynamic';

type PreviewPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params
}: PreviewPageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: {
      absolute: `Preview de migração — ${slug} — WebAppCap`
    },
    robots: {
      index: false,
      follow: false
    }
  };
}

export default async function MigrationPreviewPage({
  params
}: PreviewPageProps) {
  const { slug } = await params;
  const result = await readSheetsPublishedSiteBySlug(slug);

  if (!result) {
    notFound();
  }

  return renderTemplate({
    project: result.project,
    data: result.data,
    preview: true
  });
}
