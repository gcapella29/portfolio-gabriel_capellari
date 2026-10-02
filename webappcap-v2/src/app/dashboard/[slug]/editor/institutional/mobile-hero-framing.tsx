'use client';
import {useState} from 'react';
import {institutionalImage} from '@/core/institutional-content';
import DraggableImagePreview from '../../content/draggable-image-preview';

export default function MobileHeroFraming({hero}:{hero:unknown}) {
  const row = hero && typeof hero === 'object' ? hero as Record<string, unknown> : {};
  const mobile = row.mobile && typeof row.mobile === 'object' ? row.mobile as Record<string, unknown> : {};
  const [enabled, setEnabled] = useState(Boolean(row.mobile));
  const [position, setPosition] = useState(String(mobile.position || row.position || 'center'));
  const [zoom, setZoom] = useState(Number(mobile.zoom || row.zoom) || 100);
  const [fit, setFit] = useState(String(mobile.fit || row.fit || 'cover'));
  const src = institutionalImage(hero);
  return <div className="image-editor-card">
    <h3>Enquadramento do hero no celular</h3>
    <p>Use a mesma foto com posição e zoom próprios no celular. A referência é 390 × 640; a altura real varia com o conteúdo. Para uma foto recém-enviada aparecer aqui, salve o rascunho primeiro.</p>
    <label className="field"><span>Enquadramento mobile</span><select value={String(enabled)} onChange={event=>setEnabled(event.target.value==='true')}><option value="false">Usar o enquadramento do desktop</option><option value="true">Personalizar no celular</option></select></label>
    <input type="hidden" name="heroMobileEnabled" value={String(enabled)}/>
    {enabled ? <>
      <label className="field"><span>Ajuste da imagem no celular</span><select value={fit} onChange={event=>setFit(event.target.value)}><option value="cover">Preencher</option><option value="contain">Mostrar inteira</option><option value="fill">Esticar</option></select></label>
      {src ? <div className="image-editor-preview" style={{maxWidth:300}}><DraggableImagePreview src={src} alt="Hero no celular" position={position} fit={fit} zoom={zoom} aspectRatio="390 / 640" onPositionChange={setPosition} onZoomChange={setZoom}/></div> : <p>Salve uma foto do hero para ajustar o enquadramento.</p>}
      <input type="hidden" name="heroMobilePosition" value={position}/><input type="hidden" name="heroMobileFit" value={fit}/><input type="hidden" name="heroMobileZoom" value={zoom}/>
    </> : null}
  </div>;
}
