import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {readV2Content} from '@/core/onboarding-data';
import EditorWorkspaceHeader from '../../editor-workspace-header';
import InstitutionalEditor from './institutional-editor';
import styles from '../editor.module.css';
export default async function InstitutionalEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{slug: string}>;
  searchParams: Promise<{saved?: string}>;
}) {
  const {slug} = await params,
    {saved} = await searchParams,
    {project, role} = await resolveProjectAccess(slug);
  if (project.segment !== 'institutional' || !can(role, 'editContent'))
    redirect(`/dashboard/${encodeURIComponent(project.slug)}`);
  const data = await readV2Content(project.id);
  return (
    <div className={styles.page}>
      <EditorWorkspaceHeader
        eyebrow="EDITAR SITE · INSTITUCIONAL"
        title={project.name}
        description="Projetos, campanhas, história, gestão e fotos. Salve no rascunho, confira no Preview e publique."
        facts={[{label: 'Modelo', value: 'Institucional'}]}
      />
      <p className="notice">
        Substitua os textos, nomes e imagens de exemplo por informações reais.
        Configure o WhatsApp e confira a chave e o beneficiário do Pix antes de
        publicar.
      </p>
      {saved ? (
        <div className="notice success" role="status">
          Salvo no rascunho. Confira no Preview antes de publicar.
        </div>
      ) : null}
      <section className={styles.realEditor}>
        <InstitutionalEditor
          projectId={project.id}
          slug={project.slug}
          data={data}
          canManageMedia={can(role, 'manageMedia')}
          saved={Boolean(saved)}
        />
      </section>
    </div>
  );
}
