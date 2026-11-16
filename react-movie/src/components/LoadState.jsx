export default function LoadState({ loading, error, retry, empty }) {
  if (loading) return <p className="status" role="status">Caricamento…</p>;
  if (error) return <div className="status" role="alert">
    <p>Impossibile caricare i contenuti. Controlla la connessione e riprova.</p>
    <button className="button" onClick={retry} data-tv-focus data-focus-id="retry" data-page-focus>Riprova</button>
  </div>;
  return empty ? <p className="status" role="status">Nessun titolo trovato. Prova a cambiare i filtri o la ricerca.</p> : null;
}
