type AccessEmailInput={to:string;projectName:string;loginUrl:string;temporaryPassword?:string};

export async function sendProjectAccessEmail(input:AccessEmailInput){
 const apiKey=process.env.RESEND_API_KEY,from=process.env.WEBAPPCAP_FROM_EMAIL;
 if(!apiKey||!from)throw new Error('Envio de e-mail não configurado. Defina RESEND_API_KEY e WEBAPPCAP_FROM_EMAIL.');
 const passwordBlock=input.temporaryPassword?`<p><strong>Senha provisória:</strong> <code style="font-size:16px">${escapeHtml(input.temporaryPassword)}</code></p><p>Depois de entrar, abra <strong>Configurações</strong> no painel e crie sua senha definitiva.</p>`:'<p>Seu e-mail já possuía uma conta WebAppCap. Use sua senha atual e, se quiser, altere-a em <strong>Configurações</strong>.</p>';
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${apiKey}`,'content-type':'application/json'},body:JSON.stringify({from,to:[input.to],subject:`Acesso ao projeto ${input.projectName} — WebAppCap`,html:`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>Seu acesso ao WebAppCap</h2><p>Você foi adicionado à equipe do projeto <strong>${escapeHtml(input.projectName)}</strong>.</p>${passwordBlock}<p><a href="${escapeHtml(input.loginUrl)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#142039;color:#fff;text-decoration:none;font-weight:700">Entrar no painel</a></p><p style="color:#667085;font-size:12px">Por segurança, não encaminhe suas credenciais.</p></div>`})});
 if(!response.ok)throw new Error(`Falha ao enviar e-mail de acesso (${response.status}).`);
}

function escapeHtml(value:string){return value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]||char))}
