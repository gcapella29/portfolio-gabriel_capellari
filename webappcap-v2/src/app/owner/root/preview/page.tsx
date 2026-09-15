import { requirePlatformOwner } from '@/core/session';
import { readRootDraft } from '@/core/root-site';
import { HomeSite } from '@/app/home-site';

export default async function RootPreviewPage(){
  await requirePlatformOwner();
  const {draft}=await readRootDraft();
  return <HomeSite content={draft} preview/>;
}
