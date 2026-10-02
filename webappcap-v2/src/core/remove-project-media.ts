/** Storage may report success while RLS silently prevents deletion. Verify progress. */
export async function removeProjectMedia(
  list: () => Promise<string[]>,
  remove: (paths: string[]) => Promise<void>
): Promise<void> {
  let previous = new Set<string>();
  for (let page = 0; page < 100; page++) {
    const paths = await list();
    if (!paths.length) return;
    if (paths.some(path => previous.has(path))) {
      throw new Error('A remoção das imagens não avançou. Verifique as permissões do Storage e a migração 025.');
    }
    previous = new Set(paths);
    for (let i = 0; i < paths.length; i += 100) await remove(paths.slice(i, i + 100));
  }
  if ((await list()).length) throw new Error('O projeto possui mais arquivos do que o limite de uma operação.');
}
