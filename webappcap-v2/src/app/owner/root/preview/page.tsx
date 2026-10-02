import { requirePlatformOwner } from '@/core/session';
import { readRootDraft } from '@/core/root-site';
import {readPublishedHomeProjects} from '@/core/home-projects';
import { HomeSite } from '@/app/home-site';

export default async function RootPreviewPage(){
  await requirePlatformOwner();
  const {draft}=await readRootDraft();
  const publishedProjects=await readPublishedHomeProjects();
  return <HomeSite content={draft} publishedProjects={publishedProjects} preview/>;
}
