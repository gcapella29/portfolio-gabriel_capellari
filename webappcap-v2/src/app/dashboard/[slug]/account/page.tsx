import {resolveProjectAccess} from '@/core/session';
import PasswordSettings from './password-settings';

export default async function AccountSettingsPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,{user}=await resolveProjectAccess(slug);
 return <div className="editor-page"><header><span className="eyebrow dark-text">CONFIGURAÇÕES</span><h1>Sua conta</h1><p>Gerencie o acesso usado para entrar no WebAppCap.</p></header><section className="editor-section"><h2>Senha</h2><p className="help">Conta: {user.email||'E-mail não disponível'}. Se você entrou com uma senha provisória recebida por e-mail, altere-a aqui.</p><PasswordSettings/></section></div>;
}
