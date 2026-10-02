'use client';
import {useMemo, useState} from 'react';
import {
  institutionalCopy,
  institutionalBlocks,
  institutionalData,
  institutionalLists,
  institutionalImage,
  type InstitutionalListKey,
  type InstitutionalRow,
} from '@/core/institutional-content';
import type {V2Content} from '@/core/onboarding-data';
import ContentWorkspace from '../../content/content-workspace';
import DirectImageField from '../../content/direct-image-field';
import EditorBlock from '../editor-block';
import {saveInstitutionalAction} from './actions';
import {imageEditorFrame} from '@/core/image-editor-frame';
import styles from './institutional-editor.module.css';
const text = (value: unknown) => String(value ?? '');
const listOrder:InstitutionalListKey[]=['institutional_campaigns',...Object.keys(institutionalLists).filter(key=>key!=='institutional_campaigns') as InstitutionalListKey[]];
export default function InstitutionalEditor({
  projectId,
  slug,
  data,
  canManageMedia,
  saved,
}: {
  projectId: string;
  slug: string;
  data: V2Content;
  canManageMedia: boolean;
  saved: boolean;
}) {
  const initial = useMemo(
      () => institutionalData(data.content),
      [data.content],
    ),
    [lists, setLists] = useState(() => initial.lists);
  const update = (
    key: InstitutionalListKey,
    id: string,
    field: string,
    value: unknown,
  ) =>
    setLists((current) => ({
      ...current,
      [key]: current[key].map((row) =>
        row.id === id ? {...row, [field]: value} : row,
      ),
    }));
  const field = (key: string, label: string, value: unknown) => (
    <label className="field" key={key}>
      <span>{label}</span>
      <textarea
        name={key}
        defaultValue={text(value)}
        maxLength={10000}
        rows={2}
      />
    </label>
  );
  const image = (
    name: string,
    current: unknown,
    label: string,
    slotType = 'photo',
  ) => {
    const item =
      current && typeof current === 'object'
        ? (current as Record<string, unknown>)
        : {};
    return (
      <DirectImageField
        key={name}
        projectId={projectId}
        name={`uploadedMedia:${name}`}
        slot={name}
        label={label}
        current={institutionalImage(current)}
        currentPosition={text(item.position) || 'center'}
        currentFit={text(item.fit) || 'cover'}
        currentZoom={text(item.zoom) || 100}
        {...imageEditorFrame('institutional-main-1', slotType)}
        {...(slotType === 'person' ? {previewMaxWidth: 180} : {})}
        help={
          slotType === 'hero'
            ? 'Imagem grande ao fundo. Referência desktop 2:1; a altura varia com o conteúdo e a tela. Arraste livremente, ajuste o zoom e confira no Preview.'
            : 'Enquadramento do site. Arraste, ajuste o zoom e salve o rascunho.'
        }
      />
    );
  };
  const activation = (key:keyof typeof institutionalBlocks) => <label className={`field ${styles.activation}`}><span>{institutionalBlocks[key]} no site</span><select name={`institutional_visible_${key}`} defaultValue={String(initial.visible[key] && (!['current_board','current_members','previous_board','previous_members'].includes(key) || initial.visible.gestao))}><option value="true">Ativado</option><option value="false">Desativado</option></select></label>;
  const listBlock:Partial<Record<InstitutionalListKey,keyof typeof institutionalBlocks>> = {institutional_projects:'projetos',institutional_donations:'doacoes',institutional_campaigns:'campanhas',institutional_timeline:'historia',institutional_values:'valores',institutional_current_board:'current_board',institutional_current_members:'current_members',institutional_previous_board:'previous_board',institutional_previous_members:'previous_members',institutional_albums:'fotos'};
  const nav = [
    {id: 'institutional-identity', label: 'Identidade'},
    ...listOrder.map((key) => ({
      id: `institutional-${key}`,
      label: institutionalLists[key].label,
    })),
    {id: 'institutional-contact', label: 'Contato e Pix'},
    {id: 'institutional-copy', label: 'Textos do modelo'},
  ];
  return (
    <ContentWorkspace
      slug={slug}
      previewUrl={`/preview/${encodeURIComponent(slug)}?template=institutional-main-1`}
      saved={saved}
      portfolio={false}
      nav={nav}
      action={saveInstitutionalAction}
      embedded
    >
      <EditorBlock
        id="institutional-identity"
        number="01"
        title="Identidade e história"
        summary="Nome, foto de capa, apresentação e períodos"
      >
        <div className={styles.activationRow}>{activation("hero")}{activation("stats")}</div>
        <div className={styles.fields}>
          <label className="field">
            <span>Nome da organização</span>
            <input
              name="name"
              defaultValue={text(data.identity.name)}
              required
              maxLength={120}
            />
          </label>
          {field('institutional_main_hero_kicker','Frase acima do título do hero (organização e cidade)',initial.copy.institutional_main_hero_kicker)}
          <label className="field">
            <span>Título da aba do navegador</span>
            <input
              name="browser_title"
              defaultValue={text(data.identity.browser_title)}
              maxLength={80}
            />
          </label>
          {field(
            'institutional_history_intro',
            'Introdução da história',
            initial.historyIntro,
          )}
          {field(
            'institutional_current_period',
            'Período da gestão atual',
            initial.currentPeriod,
          )}
          {field(
            'institutional_previous_period',
            'Período da gestão anterior',
            initial.previousPeriod,
          )}
          <label className="field">
            <span>Fotos ilustrativas nos álbuns vazios</span>
            <select
              name="institutional_demo"
              defaultValue={String(initial.demo)}
            >
              <option value="true">Mostrar (conteúdo de exemplo)</option>
              <option value="false">Ocultar (conteúdo real)</option>
            </select>
          </label>
          <label className="field">
            <span>Fotos das pessoas</span>
            <select
              name="institutional_show_photos"
              defaultValue={String(initial.showPhotos)}
            >
              <option value="true">Mostrar quando cadastradas</option>
              <option value="false">Mostrar somente iniciais</option>
            </select>
          </label>

          {canManageMedia
            ? image('hero', data.media.hero, 'Foto do hero (opcional)', 'hero')
            : null}
        </div>
      </EditorBlock>
      {listOrder.map(
        (key, listIndex) => (
          <EditorBlock
            id={`institutional-${key}`}
            number={String(listIndex + 2).padStart(2, '0')}
            title={institutionalLists[key].label}
            summary="Adicione, edite e ordene os itens"
            key={key}
          >
            {listBlock[key] ? activation(listBlock[key]!) : null}
            <input
              type="hidden"
              name={`section:${key}`}
              value={JSON.stringify(lists[key])}
            />
            <div className={styles.rows}>
              {!lists[key].length ? <p>Nenhum item cadastrado.</p> : null}
              {lists[key].map((row, index) => (
                <fieldset
                  className={`${styles.row} ${(key.includes('board') || key.includes('members')) && canManageMedia ? styles.personRow : ''}`}
                  key={row.id}
                >
                  <legend>
                    {key.includes('board') || key.includes('members')
                      ? `${text(row.role) || (key.includes('board') ? 'Cargo não definido' : 'Membro')} · ${text(row.name) || 'Nome não informado'}`
                      : `${index + 1}. ${text(row.title || row.t) || 'Novo item'}`}
                  </legend>
                  {Object.entries(institutionalLists[key].fields).map(
                    ([keyField, label]) =>
                      keyField === 'photo' || keyField === 'image' ? (
                        canManageMedia ? (
                          <div key={keyField} className={styles.media}>
                            {image(
                              `${key}-${row.id}-${keyField}`,
                              row[keyField],
                              label,
                              keyField === 'image'
                                ? key === 'institutional_campaigns'
                                  ? 'campaign'
                                  : 'project'
                                : 'person',
                            )}
                          </div>
                        ) : null
                      ) : (
                        <label
                          className={`field ${['text', 'd', 'impact'].includes(keyField) ? styles.wide : ''}`}
                          key={keyField}
                        >
                          <span>{label}</span>
                          {['text', 'd', 'impact'].includes(keyField) ? (
                            <textarea
                              value={text(row[keyField])}
                              onChange={(event) =>
                                update(
                                  key,
                                  row.id,
                                  keyField,
                                  event.target.value,
                                )
                              }
                              maxLength={10000}
                              rows={3}
                            />
                          ) : (
                            <input
                              value={text(row[keyField])}
                              onChange={(event) =>
                                update(
                                  key,
                                  row.id,
                                  keyField,
                                  event.target.value,
                                )
                              }
                              maxLength={keyField === 'instagram' ? 1000 : 300}
                              placeholder={
                                keyField === 'role'
                                  ? 'Ex.: Presidente, Vice-presidente, Secretário'
                                  : keyField === 'instagram'
                                    ? '@usuario ou https://instagram.com/usuario'
                                    : undefined
                              }
                            />
                          )}
                        </label>
                      ),
                  )}
                  {key === 'institutional_albums' ? (
                    <>
                      {(Array.isArray(row.photos) ? row.photos : []).map(
                        (photo, i) => (
                          <div key={`${row.id}-photo-${i}`}>
                            {canManageMedia ? (
                              image(
                                `${key}-${row.id}-photo-${i}`,
                                photo,
                                `Foto ${i + 1}`,
                              )
                            ) : (
                              <p>Foto {i + 1}</p>
                            )}
                          </div>
                        ),
                      )}
                      {canManageMedia ? (
                        <button
                          className="action secondary"
                          type="button"
                          disabled={
                            Array.isArray(row.photos) &&
                            row.photos.length >= 100
                          }
                          onClick={() =>
                            update(key, row.id, 'photos', [
                              ...(Array.isArray(row.photos) ? row.photos : []),
                              '',
                            ])
                          }
                        >
                          Adicionar foto ao álbum
                        </button>
                      ) : null}
                    </>
                  ) : null}
                  <div className={styles.rowActions}>
                    <button
                      className="action secondary"
                      type="button"
                      disabled={index === 0}
                      onClick={() =>
                        setLists((current) => {
                          const rows = [...current[key]];
                          [rows[index - 1], rows[index]] = [
                            rows[index],
                            rows[index - 1],
                          ];
                          return {...current, [key]: rows};
                        })
                      }
                    >
                      Mover para cima
                    </button>
                    <button
                      className="action secondary"
                      type="button"
                      disabled={index === lists[key].length - 1}
                      onClick={() =>
                        setLists((current) => {
                          const rows = [...current[key]];
                          [rows[index], rows[index + 1]] = [
                            rows[index + 1],
                            rows[index],
                          ];
                          return {...current, [key]: rows};
                        })
                      }
                    >
                      Mover para baixo
                    </button>
                    <button
                      className="action secondary"
                      type="button"
                      onClick={() =>
                        setLists((current) => ({
                          ...current,
                          [key]: current[key].filter(
                            (item) => item.id !== row.id,
                          ),
                        }))
                      }
                    >
                      Remover item
                    </button>
                  </div>
                </fieldset>
              ))}
              <button
                className="action secondary"
                type="button"
                disabled={lists[key].length >= 100}
                onClick={() =>
                  setLists((current) => ({
                    ...current,
                    [key]: [
                      ...current[key],
                      {
                        id: crypto.randomUUID(),
                        ...Object.fromEntries(
                          Object.keys(institutionalLists[key].fields).map(
                            (field) => [field, ''],
                          ),
                        ),
                        ...(key === 'institutional_albums' ? {photos: []} : {}),
                      } as InstitutionalRow,
                    ],
                  }))
                }
              >
                Adicionar item
              </button>
            </div>
          </EditorBlock>
        ),
      )}
      <EditorBlock
        id="institutional-contact"
        number="12"
        title="Contato e Pix"
        summary="Canais reais da organização e chave de doação"
      >
        {activation("contato")}
        <div className={styles.fields}>
          {[
            ['whatsapp', 'WhatsApp com DDI'],
            ['email', 'E-mail'],
            ['address', 'Endereço'],
            ['instagram', 'Instagram (URL completa)'],
            ['pix', 'Chave Pix'],
            ['pix_name', 'Nome do beneficiário do Pix'],
          ].map(([key, label]) => field(key, label, data.contact[key]))}
        </div>
        <p>
          O formulário abre uma mensagem no WhatsApp. O Pix apenas copia a
          chave; não processa pagamentos.
        </p>
      </EditorBlock>
      <EditorBlock
        id="institutional-copy"
        number="13"
        title="Textos e chamadas do modelo"
        summary="Navegação, hero, títulos e formulário"
      >
        {activation("band")}
        <div className={styles.fields}>
          {Object.entries(institutionalCopy)
            .filter(
              ([key]) =>
                ![
                  'institutional_main_demo_notice',
                  'institutional_main_hero_kicker',
                  'institutional_main_close',
                  'institutional_main_footer_brand',
                  'institutional_main_footer_credit',
                ].includes(key),
            )
            .map(([key, fallback]) =>
              field(
                key,
                `${fallback.trim() || key} — texto`,
                initial.copy[key as keyof typeof institutionalCopy],
              ),
            )}
        </div>
      </EditorBlock>
    </ContentWorkspace>
  );
}
