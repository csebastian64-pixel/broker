import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  FolderArchive,
  History,
  Mail,
  Receipt,
  Search,
  Send,
  ShieldCheck,
  ShieldAlert,
  Upload,
  UserRound,
  Building2,
  XCircle,
} from 'lucide-react';

const initialRequests = [
  {
    id: 'RB-2026-001',
    cliente: 'Alfa Meccanica S.r.l.',
    tipoCliente: 'Persona giuridica',
    partitaIva: '10456780962',
    firmatario: 'Giulia Ferri',
    poteriFirmaVerificati: true,
    prodotto: 'Polizza Danni Azienda',
    ramo: 'Danni',
    specialista: 'Marco Rossi',
    areaCommerciale: 'Milano Nord',
    dataInvio: '2026-04-01',
    stato: 'In valutazione',
    fase: 'Valutazione Bancassurance',
    premioStimato: '€ 4.500',
    needs: 'Copertura incendio, furto, eventi atmosferici e RC verso terzi.',
    note: 'Richiesta prioritaria per rinnovo con estensione garanzia eventi atmosferici.',
    targetMarket: 'Coerente',
    privacyBMed: true,
    privacyBroker: false,
    dnFirmato: false,
    quotazioneRicevuta: false,
    pagamentoRicevuto: false,
    polizzaEmessa: false,
    pritGenerato: false,
    archiviata: false,
    broker: 'Broker Delta',
    canaleInvio: 'Digital Form',
    documenti: ['Privacy firmata', 'Questionario rischio', 'Visura camerale'],
    esito: '',
    motivoEsito: '',
    audit: [
      { data: '2026-04-01 09:10', utente: 'Marco Rossi', azione: 'Creazione pratica', dettaglio: 'Inserimento via Digital Form' },
      { data: '2026-04-01 10:05', utente: 'Bancassurance', azione: 'Presa in carico', dettaglio: 'Avviata verifica documentale' },
    ],
    timeline: [
      { step: 'Richiesta inserita', status: 'done' },
      { step: 'Valutazione', status: 'current' },
      { step: 'Invio al Broker', status: 'todo' },
      { step: 'Quotazione', status: 'todo' },
      { step: 'Ordine fermo', status: 'todo' },
      { step: 'Pagamento', status: 'todo' },
      { step: 'Emissione', status: 'todo' },
      { step: 'PRIT e archiviazione', status: 'todo' },
    ],
  },
  {
    id: 'RB-2026-002',
    cliente: 'Studio Delta Associati',
    tipoCliente: 'Persona giuridica',
    partitaIva: '09765430128',
    firmatario: 'Luca Bassi',
    poteriFirmaVerificati: false,
    prodotto: 'Polizza Professionale',
    ramo: 'Danni',
    specialista: 'Laura Bianchi',
    areaCommerciale: 'Roma Centro',
    dataInvio: '2026-04-02',
    stato: 'Da integrare',
    fase: 'Attesa integrazione Specialista',
    premioStimato: '€ 1.280',
    needs: 'Tutela professionale e RC.',
    note: 'Manca conferma poteri di firma e dettaglio attività prevalente.',
    targetMarket: 'Da verificare',
    privacyBMed: true,
    privacyBroker: false,
    dnFirmato: false,
    quotazioneRicevuta: false,
    pagamentoRicevuto: false,
    polizzaEmessa: false,
    pritGenerato: false,
    archiviata: false,
    broker: 'Broker Delta',
    canaleInvio: 'Email',
    documenti: ['Privacy firmata'],
    esito: 'Integrazione richiesta',
    motivoEsito: 'Assente documento poteri di firma.',
    audit: [
      { data: '2026-04-02 11:00', utente: 'Laura Bianchi', azione: 'Creazione pratica', dettaglio: 'Inserimento richiesta via email' },
      { data: '2026-04-02 12:20', utente: 'Valutatore', azione: 'Richiesta integrazione', dettaglio: 'Servono poteri di firma' },
    ],
    timeline: [
      { step: 'Richiesta inserita', status: 'done' },
      { step: 'Valutazione', status: 'done' },
      { step: 'Integrazione', status: 'current' },
      { step: 'Invio al Broker', status: 'todo' },
      { step: 'Quotazione', status: 'todo' },
      { step: 'Ordine fermo', status: 'todo' },
      { step: 'Pagamento', status: 'todo' },
      { step: 'Emissione', status: 'todo' },
    ],
  },
  {
    id: 'RB-2026-003',
    cliente: 'Gamma Retail S.p.A.',
    tipoCliente: 'Persona giuridica',
    partitaIva: '08976540155',
    firmatario: 'Chiara Serra',
    poteriFirmaVerificati: true,
    prodotto: 'Polizza Danni Commerciale',
    ramo: 'Danni',
    specialista: 'Marco Rossi',
    areaCommerciale: 'Torino',
    dataInvio: '2026-03-29',
    stato: 'Ordine fermo',
    fase: 'Attesa pagamento Broker',
    premioStimato: '€ 8.900',
    needs: 'Copertura multirischio punto vendita e magazzino.',
    note: 'D&N firmato e preventivo accettato. In attesa bonifico verso Broker.',
    targetMarket: 'Coerente',
    privacyBMed: true,
    privacyBroker: true,
    dnFirmato: true,
    quotazioneRicevuta: true,
    pagamentoRicevuto: false,
    polizzaEmessa: false,
    pritGenerato: false,
    archiviata: false,
    broker: 'Broker Sigma',
    canaleInvio: 'Digital Form',
    documenti: ['Privacy firmata', 'Questionario rischio', 'Ultimo attestato', 'Visura camerale', 'Quotazione broker', 'Scheda target market', 'D&N firmato'],
    esito: 'Ordine fermo acquisito',
    motivoEsito: 'Accettazione preventivo e D&N completati.',
    audit: [
      { data: '2026-03-29 09:00', utente: 'Marco Rossi', azione: 'Creazione pratica', dettaglio: 'Richiesta iniziale' },
      { data: '2026-03-29 11:30', utente: 'Bancassurance', azione: 'Approvazione', dettaglio: 'Inviata al Broker' },
      { data: '2026-03-30 15:10', utente: 'Broker Sigma', azione: 'Quotazione ricevuta', dettaglio: 'Ricevuta quotazione e privacy broker' },
      { data: '2026-03-31 17:45', utente: 'Marco Rossi', azione: 'Ordine fermo', dettaglio: 'Cliente ha accettato preventivo' },
    ],
    timeline: [
      { step: 'Richiesta inserita', status: 'done' },
      { step: 'Valutazione', status: 'done' },
      { step: 'Invio al Broker', status: 'done' },
      { step: 'Quotazione', status: 'done' },
      { step: 'Ordine fermo', status: 'done' },
      { step: 'Pagamento', status: 'current' },
      { step: 'Emissione', status: 'todo' },
      { step: 'PRIT e archiviazione', status: 'todo' },
    ],
  },
  {
    id: 'RB-2026-004',
    cliente: 'Casa Serena S.r.l.',
    tipoCliente: 'Persona giuridica',
    partitaIva: '10111222333',
    firmatario: 'Enrico Sala',
    poteriFirmaVerificati: true,
    prodotto: 'Polizza Fabbricati',
    ramo: 'Danni',
    specialista: 'Anna Verdi',
    areaCommerciale: 'Bologna',
    dataInvio: '2026-03-28',
    stato: 'Emessa',
    fase: 'Archiviazione finale',
    premioStimato: '€ 6.750',
    needs: 'Fabbricato, incendio, eventi naturali, responsabilità civile.',
    note: 'Pagamento confermato, polizza emessa e documentazione inviata a rete e cliente.',
    targetMarket: 'Coerente',
    privacyBMed: true,
    privacyBroker: true,
    dnFirmato: true,
    quotazioneRicevuta: true,
    pagamentoRicevuto: true,
    polizzaEmessa: true,
    pritGenerato: true,
    archiviata: true,
    broker: 'Broker Sigma',
    canaleInvio: 'Digital Form',
    documenti: ['Privacy firmata', 'Questionario rischio', 'Quotazione broker', 'Scheda target market', 'D&N firmato', 'Polizza firmata', 'Ricevuta pagamento', 'PRIT'],
    esito: 'Emissione completata',
    motivoEsito: 'Polizza emessa, inviata e archiviata.',
    audit: [
      { data: '2026-03-28 09:15', utente: 'Anna Verdi', azione: 'Creazione pratica', dettaglio: 'Pratica iniziale' },
      { data: '2026-03-28 11:20', utente: 'Bancassurance', azione: 'Invio broker', dettaglio: 'Richiesta inoltrata' },
      { data: '2026-03-29 10:40', utente: 'Broker Sigma', azione: 'Quotazione ricevuta', dettaglio: 'Preventivo ricevuto' },
      { data: '2026-03-30 16:00', utente: 'Anna Verdi', azione: 'Ordine fermo', dettaglio: 'Cliente ha accettato' },
      { data: '2026-03-31 09:20', utente: 'Broker Sigma', azione: 'Pagamento confermato', dettaglio: 'Bonifico ricevuto' },
      { data: '2026-03-31 13:10', utente: 'Operations', azione: 'Polizza emessa', dettaglio: 'Emissione e invio documenti' },
      { data: '2026-03-31 16:30', utente: 'Operations', azione: 'Archiviazione', dettaglio: 'PRIT e archiviazione completati' },
    ],
    timeline: [
      { step: 'Richiesta inserita', status: 'done' },
      { step: 'Valutazione', status: 'done' },
      { step: 'Invio al Broker', status: 'done' },
      { step: 'Quotazione', status: 'done' },
      { step: 'Ordine fermo', status: 'done' },
      { step: 'Pagamento', status: 'done' },
      { step: 'Emissione', status: 'done' },
      { step: 'PRIT e archiviazione', status: 'done' },
    ],
  },
];

const stateClasses = {
  'In valutazione': 'badge-amber',
  'Da integrare': 'badge-orange',
  Approvata: 'badge-green',
  Rifiutata: 'badge-red',
  'Quotazione ricevuta': 'badge-violet',
  'Ordine fermo': 'badge-cyan',
  Pagata: 'badge-lime',
  Emessa: 'badge-green',
};

function StatusBadge({ value }) {
  return <span className={`badge ${stateClasses[value] || 'badge-slate'}`}>{value}</span>;
}

function IconStat({ title, value, hint, icon: Icon }) {
  return (
    <div className="card stat-card">
      <div>
        <div className="muted small">{title}</div>
        <div className="stat-value">{value}</div>
        <div className="muted tiny">{hint}</div>
      </div>
      <div className="icon-box"><Icon size={18} /></div>
    </div>
  );
}

function Timeline({ items }) {
  return (
    <div className="timeline">
      {items.map((item, idx) => (
        <div key={`${item.step}-${idx}`} className="timeline-item">
          <span className={`timeline-dot ${item.status}`} />
          <div>
            <div className="timeline-step">{item.step}</div>
            <div className="muted tiny">{item.status === 'done' ? 'Completato' : item.status === 'current' ? 'Fase attuale' : 'Da eseguire'}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CheckRow({ checked, label }) {
  return (
    <label className="check-row">
      <input type="checkbox" checked={checked} readOnly />
      <span>{label}</span>
    </label>
  );
}

function RequestDetail({ request, role, onApprove, onReject, onIntegrate, onSendToBroker, onReceiveQuote, onSetOrderFermo, onRegisterPayment, onIssuePolicy }) {
  const [comment, setComment] = useState('');

  if (!request) {
    return <div className="card empty-state">Seleziona una pratica per vedere i dettagli.</div>;
  }

  return (
    <div className="card detail-card">
      <div className="detail-header">
        <div>
          <h2>{request.id} · {request.cliente}</h2>
          <div className="muted">{request.prodotto} · {request.ramo}</div>
        </div>
        <StatusBadge value={request.stato} />
      </div>

      <div className="detail-grid">
        <div className="info-box"><div className="muted small">Specialista</div><div className="strong">{request.specialista}</div><div className="muted tiny">{request.areaCommerciale}</div></div>
        <div className="info-box"><div className="muted small">Broker</div><div className="strong">{request.broker}</div><div className="muted tiny">Canale: {request.canaleInvio}</div></div>
        <div className="info-box"><div className="muted small">Tipo cliente</div><div className="strong">{request.tipoCliente}</div><div className="muted tiny">P.IVA {request.partitaIva}</div></div>
        <div className="info-box"><div className="muted small">Firmatario</div><div className="strong">{request.firmatario}</div><div className={`tiny ${request.poteriFirmaVerificati ? 'ok' : 'warn'}`}>{request.poteriFirmaVerificati ? 'Poteri di firma verificati' : 'Poteri di firma da verificare'}</div></div>
        <div className="info-box"><div className="muted small">Premio stimato</div><div className="strong">{request.premioStimato}</div></div>
        <div className="info-box"><div className="muted small">Target market</div><div className="strong">{request.targetMarket}</div><div className="muted tiny">Fase: {request.fase}</div></div>
        <div className="info-box span-2"><div className="muted small">Bisogni del cliente</div><div>{request.needs}</div></div>
        <div className="info-box span-2"><div className="muted small">Note operative</div><div>{request.note}</div></div>
        <div className="info-box span-2">
          <div className="muted small mb8">Checklist processo</div>
          <div className="check-grid">
            <CheckRow checked={request.privacyBMed} label="Privacy BMed acquisita" />
            <CheckRow checked={request.privacyBroker} label="Privacy Broker acquisita" />
            <CheckRow checked={request.dnFirmato} label="Demands & Needs firmato" />
            <CheckRow checked={request.quotazioneRicevuta} label="Quotazione ricevuta" />
            <CheckRow checked={request.pagamentoRicevuto} label="Pagamento confermato" />
            <CheckRow checked={request.polizzaEmessa} label="Polizza emessa" />
            <CheckRow checked={request.pritGenerato} label="PRIT generato" />
            <CheckRow checked={request.archiviata} label="Archiviazione completata" />
          </div>
        </div>
        <div className="info-box span-2">
          <div className="muted small mb8">Documenti caricati</div>
          <div className="chips">{request.documenti.map((d) => <span key={d} className="chip">{d}</span>)}</div>
        </div>
        <div className="info-box span-2">
          <div className="muted small mb8">Avanzamento workflow</div>
          <Timeline items={request.timeline} />
        </div>
        {request.motivoEsito ? <div className="info-box span-2"><div className="muted small">Ultimo esito</div><div><strong>{request.esito}</strong> · {request.motivoEsito}</div></div> : null}
      </div>

      {['Valutatore', 'Bancassurance'].includes(role) && ['In valutazione', 'Da integrare'].includes(request.stato) && (
        <div className="action-panel">
          <div className="strong mb8">Commento valutazione</div>
          <textarea className="textarea" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Inserisci motivazione o richiesta integrazione..." />
          <div className="button-row">
            <button className="btn btn-primary" onClick={() => onApprove(request.id, comment || 'Richiesta approvata e pronta per invio al Broker.')}>Approva</button>
            <button className="btn btn-secondary" onClick={() => onIntegrate(request.id, comment || 'Integrare documentazione o dati mancanti.')}>Richiedi integrazione</button>
            <button className="btn btn-danger" onClick={() => onReject(request.id, comment || 'Richiesta non approvabile.')}>Rifiuta</button>
          </div>
        </div>
      )}

      {['Bancassurance', 'Operations', 'Amministratore'].includes(role) && ['Approvata', 'Quotazione ricevuta', 'Ordine fermo', 'Pagata'].includes(request.stato) && (
        <div className="action-panel">
          <div className="strong mb8">Azioni workflow</div>
          <div className="button-row">
            {request.stato === 'Approvata' && <button className="btn btn-secondary" onClick={() => onSendToBroker(request.id)}>Invia al Broker</button>}
            {request.stato === 'Quotazione ricevuta' && <button className="btn btn-primary" onClick={() => onSetOrderFermo(request.id)}>Conferma ordine fermo</button>}
            {request.stato === 'Ordine fermo' && <button className="btn btn-secondary" onClick={() => onRegisterPayment(request.id)}>Registra pagamento</button>}
            {request.stato === 'Pagata' && <button className="btn btn-primary" onClick={() => onIssuePolicy(request.id)}>Emetti polizza</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function ManagementReport({ requests, selectedRequest }) {
  const stats = {
    totali: requests.length,
    emesse: requests.filter((r) => r.stato === 'Emessa').length,
    daIntegrare: requests.filter((r) => r.stato === 'Da integrare').length,
    ordineFermo: requests.filter((r) => r.stato === 'Ordine fermo').length,
    backlog: requests.filter((r) => ['In valutazione', 'Approvata', 'Quotazione ricevuta', 'Pagata'].includes(r.stato)).length,
  };

  return (
    <div className="tab-section">
      <div className="report-grid">
        <div className="card report-table-card">
          <h3>Vista management pratiche</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Cliente</th><th>Specialista</th><th>Broker</th><th>Stato</th><th>Fase</th></tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.cliente}</td>
                    <td>{r.specialista}</td>
                    <td>{r.broker}</td>
                    <td><StatusBadge value={r.stato} /></td>
                    <td>{r.fase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h3>KPI workflow</h3>
          <div className="kpi-box"><div className="muted small">Tasso pratiche concluse</div><div className="stat-value">{Math.round((stats.emesse / stats.totali) * 100) || 0}%</div></div>
          <div className="kpi-box"><div className="muted small">Pratiche bloccate</div><div className="stat-value">{stats.daIntegrare + stats.ordineFermo}</div></div>
          <div className="kpi-box"><div className="muted small">Backlog operativo</div><div className="stat-value">{stats.backlog}</div></div>
        </div>
      </div>

      <div className="card mt16">
        <h3 className="with-icon"><History size={18} /> Audit trail pratica selezionata</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Data</th><th>Utente</th><th>Azione</th><th>Dettaglio</th></tr>
            </thead>
            <tbody>
              {(selectedRequest?.audit || []).map((a, idx) => (
                <tr key={`${a.data}-${idx}`}>
                  <td>{a.data}</td>
                  <td>{a.utente}</td>
                  <td>{a.azione}</td>
                  <td>{a.dettaglio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FormTab({ newRequest, setNewRequest, submitNewRequest }) {
  return (
    <div className="card">
      <h3>Inserimento nuova richiesta</h3>
      <div className="form-grid">
        <div><label>Cliente</label><input value={newRequest.cliente} onChange={(e) => setNewRequest({ ...newRequest, cliente: e.target.value })} placeholder="Ragione sociale / nominativo" /></div>
        <div>
          <label>Tipo cliente</label>
          <select value={newRequest.tipoCliente} onChange={(e) => setNewRequest({ ...newRequest, tipoCliente: e.target.value })}>
            <option>Persona fisica</option>
            <option>Persona giuridica</option>
          </select>
        </div>
        <div><label>Partita IVA / Codice fiscale</label><input value={newRequest.partitaIva} onChange={(e) => setNewRequest({ ...newRequest, partitaIva: e.target.value })} placeholder="Identificativo cliente" /></div>
        <div><label>Firmatario</label><input value={newRequest.firmatario} onChange={(e) => setNewRequest({ ...newRequest, firmatario: e.target.value })} placeholder="Nome e cognome firmatario" /></div>
        <div><label>Specialista</label><input value={newRequest.specialista} onChange={(e) => setNewRequest({ ...newRequest, specialista: e.target.value })} /></div>
        <div><label>Area commerciale</label><input value={newRequest.areaCommerciale} onChange={(e) => setNewRequest({ ...newRequest, areaCommerciale: e.target.value })} placeholder="Es. Milano Nord" /></div>
        <div>
          <label>Prodotto assicurativo</label>
          <select value={newRequest.prodotto} onChange={(e) => setNewRequest({ ...newRequest, prodotto: e.target.value })}>
            <option>Polizza Danni Azienda</option>
            <option>Polizza Danni Commerciale</option>
            <option>Polizza Professionale</option>
            <option>Polizza Fabbricati</option>
            <option>Polizza Casa</option>
          </select>
        </div>
        <div>
          <label>Broker</label>
          <select value={newRequest.broker} onChange={(e) => setNewRequest({ ...newRequest, broker: e.target.value })}>
            <option>Broker Delta</option>
            <option>Broker Sigma</option>
            <option>Broker Omega</option>
          </select>
        </div>
        <div>
          <label>Canale invio</label>
          <select value={newRequest.canaleInvio} onChange={(e) => setNewRequest({ ...newRequest, canaleInvio: e.target.value })}>
            <option>Digital Form</option>
            <option>Email</option>
            <option>PDF compilabile</option>
          </select>
        </div>
        <div><label>Premio stimato</label><input value={newRequest.premioStimato} onChange={(e) => setNewRequest({ ...newRequest, premioStimato: e.target.value })} placeholder="Es. € 2.500" /></div>
        <div className="span-2"><label>Bisogni del cliente / coperture richieste</label><textarea value={newRequest.needs} onChange={(e) => setNewRequest({ ...newRequest, needs: e.target.value })} placeholder="Descrivi bisogni, garanzie richieste, rischi da coprire..." /></div>
        <div className="span-2"><label>Note operative</label><textarea value={newRequest.note} onChange={(e) => setNewRequest({ ...newRequest, note: e.target.value })} placeholder="Urgenze, richieste broker, eccezioni, informazioni aggiuntive..." /></div>
        <div className="card sub-card">
          <div className="strong mb8">Controlli preliminari</div>
          <label className="check-row"><input type="checkbox" checked={newRequest.privacyBMed} onChange={(e) => setNewRequest({ ...newRequest, privacyBMed: e.target.checked })} /><span>Privacy BMed acquisita</span></label>
          <label className="check-row"><input type="checkbox" checked={newRequest.poteriFirmaVerificati} onChange={(e) => setNewRequest({ ...newRequest, poteriFirmaVerificati: e.target.checked })} /><span>Poteri di firma già verificati</span></label>
        </div>
        <div className="card sub-card">
          <div className="strong mb8">Documenti base</div>
          <label className="check-row"><input type="checkbox" checked={newRequest.documentiBase.privacy} onChange={(e) => setNewRequest({ ...newRequest, documentiBase: { ...newRequest.documentiBase, privacy: e.target.checked } })} /><span>Informativa privacy firmata</span></label>
          <label className="check-row"><input type="checkbox" checked={newRequest.documentiBase.questionario} onChange={(e) => setNewRequest({ ...newRequest, documentiBase: { ...newRequest.documentiBase, questionario: e.target.checked } })} /><span>Questionario rischio</span></label>
          <label className="check-row"><input type="checkbox" checked={newRequest.documentiBase.visura} onChange={(e) => setNewRequest({ ...newRequest, documentiBase: { ...newRequest.documentiBase, visura: e.target.checked } })} /><span>Visura / documenti societari</span></label>
        </div>
        <div className="span-2 upload-grid">
          {['Informativa privacy firmata', 'Questionario rischio', 'Documenti cliente / visura'].map((label) => (
            <div key={label} className="upload-box">
              <Upload size={18} />
              <div className="strong small mt8">{label}</div>
              <div className="muted tiny">Area segnaposto per allegati</div>
            </div>
          ))}
        </div>
      </div>
      <div className="button-row right mt16"><button className="btn btn-primary" onClick={submitNewRequest}>Invia in valutazione</button></div>
    </div>
  );
}

function WorkflowOverview() {
  return (
    <div className="tab-section">
      <div className="overview-grid">
        <div className="card"><h3 className="with-icon"><Send size={18} /> 1. Invio al Broker</h3><p>Bancassurance trasmette al Broker la richiesta validata.</p><p>La pratica resta tracciata per broker, canale di invio e documenti allegati.</p></div>
        <div className="card"><h3 className="with-icon"><Mail size={18} /> 2. Quotazione e D&amp;N</h3><p>Il Broker restituisce quotazione e privacy Broker.</p><p>Lo specialista condivide quotazione, D&amp;N, privacy Broker e MUP con il cliente.</p></div>
        <div className="card"><h3 className="with-icon"><Banknote size={18} /> 3. Pagamento</h3><p>Dopo l’ordine fermo, il cliente procede al pagamento verso il Broker.</p><p>Il pagamento viene registrato e la pratica passa in attesa di emissione.</p></div>
        <div className="card"><h3 className="with-icon"><Archive size={18} /> 4. Emissione e archiviazione</h3><p>Operations emette la polizza, genera PRIT, invia documenti e archivia la pratica.</p><p>Questa è la chiusura completa del workflow V3.</p></div>
      </div>
      <div className="card mt16">
        <h3>Pipeline completa end-to-end</h3>
        <div className="pipeline-grid">
          {['Richiesta', 'Valutazione', 'Broker', 'Quotazione', 'Ordine fermo', 'Pagamento', 'Emissione', 'Archiviazione'].map((step, i) => (
            <div key={step} className="pipeline-box"><div className="muted tiny">Fase {i + 1}</div><div className="strong">{step}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RulesTab() {
  return (
    <div className="tab-section">
      <div className="overview-grid rules-grid">
        <div className="card"><h3 className="with-icon"><ShieldCheck size={18} /> Ruoli</h3><p><strong>Specialista</strong>: inserisce richiesta, allega documenti e segue la pratica.</p><p><strong>Valutatore</strong>: controlla completezza e coerenza.</p><p><strong>Bancassurance</strong>: presidia invio broker, quotazione e ordine fermo.</p><p><strong>Operations</strong>: emissione polizza, PRIT, invio documenti e archiviazione.</p></div>
        <div className="card"><h3 className="with-icon"><ShieldAlert size={18} /> Campi chiave</h3><p>Cliente, firmatario, P.IVA/CF, prodotto, broker, bisogni, premio stimato.</p><p>Poteri di firma, privacy BMed, privacy Broker, D&amp;N, target market, pagamento e PRIT.</p></div>
        <div className="card"><h3 className="with-icon"><FolderArchive size={18} /> Documenti</h3><p>Privacy firmata, questionario rischio, visura/documenti cliente.</p><p>Quotazione Broker, scheda target market, D&amp;N, ricevuta pagamento, polizza firmata e PRIT.</p></div>
        <div className="card"><h3 className="with-icon"><XCircle size={18} /> Prossima release</h3><p>Rinnovi, post-vendita, sinistri e report provvigioni.</p><p>Integrazioni con sistemi documentali, anagrafiche e notifiche automatiche.</p></div>
      </div>
      <div className="card mt16">
        <h3>Matrice workflow V3</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Fase</th><th>Attore</th><th>Azione</th><th>Output</th></tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>Specialista</td><td>Inserisce richiesta con documenti base e bisogni cliente</td><td>Pratica in valutazione</td></tr>
              <tr><td>2</td><td>Valutatore / Bancassurance</td><td>Verifica privacy, completezza, poteri di firma e target market</td><td>OK / KO / integrazione</td></tr>
              <tr><td>3</td><td>Bancassurance</td><td>Invia pratica al Broker</td><td>Richiesta broker attiva</td></tr>
              <tr><td>4</td><td>Broker</td><td>Restituisce quotazione e privacy Broker</td><td>Quotazione ricevuta</td></tr>
              <tr><td>5</td><td>Specialista / Cliente</td><td>Condivisione D&amp;N, quotazione e accettazione</td><td>Ordine fermo</td></tr>
              <tr><td>6</td><td>Broker</td><td>Conferma ricezione pagamento</td><td>Pratica pagata</td></tr>
              <tr><td>7</td><td>Operations</td><td>Emette polizza, genera PRIT, archivia e invia documenti</td><td>Pratica emessa e chiusa</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState('Specialista');
  const [requests, setRequests] = useState(initialRequests);
  const [selectedId, setSelectedId] = useState(initialRequests[0].id);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tutti');
  const [tab, setTab] = useState('workflow');
  const [newRequest, setNewRequest] = useState({
    cliente: '',
    tipoCliente: 'Persona giuridica',
    partitaIva: '',
    firmatario: '',
    poteriFirmaVerificati: false,
    prodotto: 'Polizza Danni Azienda',
    ramo: 'Danni',
    specialista: 'Mario Specialista',
    areaCommerciale: '',
    broker: 'Broker Delta',
    canaleInvio: 'Digital Form',
    premioStimato: '',
    needs: '',
    note: '',
    privacyBMed: true,
    documentiBase: {
      questionario: true,
      visura: false,
      privacy: true,
    },
  });

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch = [r.id, r.cliente, r.prodotto, r.stato, r.specialista].join(' ').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'Tutti' ? true : r.stato === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const selectedRequest = requests.find((r) => r.id === selectedId);

  const stats = {
    totali: requests.length,
    inValutazione: requests.filter((r) => r.stato === 'In valutazione').length,
    daIntegrare: requests.filter((r) => r.stato === 'Da integrare').length,
    approvate: requests.filter((r) => r.stato === 'Approvata').length,
    quotazioni: requests.filter((r) => r.stato === 'Quotazione ricevuta').length,
    ordineFermo: requests.filter((r) => r.stato === 'Ordine fermo').length,
    pagate: requests.filter((r) => r.stato === 'Pagata').length,
    emesse: requests.filter((r) => r.stato === 'Emessa').length,
  };

  const appendAudit = (request, entry) => [...(request.audit || []), entry];
  const updateRequest = (id, patch) => setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const approveRequest = (id, comment) => {
    const req = requests.find((r) => r.id === id);
    updateRequest(id, {
      stato: 'Approvata',
      fase: 'Pronta per invio a Broker',
      esito: 'OK',
      motivoEsito: comment,
      audit: appendAudit(req, { data: '2026-04-03 10:30', utente: role, azione: 'Approvata', dettaglio: comment }),
      timeline: [
        { step: 'Richiesta inserita', status: 'done' },
        { step: 'Valutazione', status: 'done' },
        { step: 'Invio al Broker', status: 'current' },
        { step: 'Quotazione', status: 'todo' },
        { step: 'Ordine fermo', status: 'todo' },
        { step: 'Pagamento', status: 'todo' },
        { step: 'Emissione', status: 'todo' },
        { step: 'PRIT e archiviazione', status: 'todo' },
      ],
    });
  };

  const rejectRequest = (id, comment) => {
    const req = requests.find((r) => r.id === id);
    updateRequest(id, {
      stato: 'Rifiutata',
      fase: 'Chiusa',
      esito: 'KO',
      motivoEsito: comment,
      audit: appendAudit(req, { data: '2026-04-03 10:40', utente: role, azione: 'Rifiutata', dettaglio: comment }),
    });
  };

  const integrateRequest = (id, comment) => {
    const req = requests.find((r) => r.id === id);
    updateRequest(id, {
      stato: 'Da integrare',
      fase: 'Attesa integrazione Specialista',
      esito: 'Integrazione richiesta',
      motivoEsito: comment,
      audit: appendAudit(req, { data: '2026-04-03 10:45', utente: role, azione: 'Integrazione richiesta', dettaglio: comment }),
      timeline: [
        { step: 'Richiesta inserita', status: 'done' },
        { step: 'Valutazione', status: 'done' },
        { step: 'Integrazione', status: 'current' },
        { step: 'Invio al Broker', status: 'todo' },
        { step: 'Quotazione', status: 'todo' },
        { step: 'Ordine fermo', status: 'todo' },
        { step: 'Pagamento', status: 'todo' },
        { step: 'Emissione', status: 'todo' },
      ],
    });
  };

  const sendToBroker = (id) => {
    const req = requests.find((r) => r.id === id);
    updateRequest(id, {
      fase: 'Richiesta inviata al Broker',
      note: 'Richiesta trasmessa al Broker per valutazione e predisposizione quotazione.',
      audit: appendAudit(req, { data: '2026-04-03 11:00', utente: 'Bancassurance', azione: 'Invio broker', dettaglio: 'Richiesta trasmessa al broker' }),
      timeline: [
        { step: 'Richiesta inserita', status: 'done' },
        { step: 'Valutazione', status: 'done' },
        { step: 'Invio al Broker', status: 'done' },
        { step: 'Quotazione', status: 'current' },
        { step: 'Ordine fermo', status: 'todo' },
        { step: 'Pagamento', status: 'todo' },
        { step: 'Emissione', status: 'todo' },
        { step: 'PRIT e archiviazione', status: 'todo' },
      ],
    });
  };

  const receiveQuote = (id) => {
    const req = requests.find((r) => r.id === id);
    updateRequest(id, {
      stato: 'Quotazione ricevuta',
      fase: 'Attesa accettazione preventivo',
      privacyBroker: true,
      quotazioneRicevuta: true,
      documenti: Array.from(new Set([...(req.documenti || []), 'Quotazione broker', 'Scheda target market'])),
      note: 'Ricevuta quotazione dal Broker. Da condividere con cliente insieme a D&N, privacy broker e MUP.',
      audit: appendAudit(req, { data: '2026-04-03 12:00', utente: req.broker, azione: 'Quotazione ricevuta', dettaglio: 'Ricevuta quotazione e privacy broker' }),
      timeline: [
        { step: 'Richiesta inserita', status: 'done' },
        { step: 'Valutazione', status: 'done' },
        { step: 'Invio al Broker', status: 'done' },
        { step: 'Quotazione', status: 'done' },
        { step: 'Ordine fermo', status: 'current' },
        { step: 'Pagamento', status: 'todo' },
        { step: 'Emissione', status: 'todo' },
        { step: 'PRIT e archiviazione', status: 'todo' },
      ],
    });
  };

  const setOrderFermo = (id) => {
    const req = requests.find((r) => r.id === id);
    updateRequest(id, {
      stato: 'Ordine fermo',
      fase: 'Attesa pagamento Broker',
      dnFirmato: true,
      documenti: Array.from(new Set([...(req.documenti || []), 'D&N firmato'])),
      esito: 'Ordine fermo acquisito',
      motivoEsito: 'Accettazione preventivo e D&N completati. Pratica pronta per pagamento.',
      audit: appendAudit(req, { data: '2026-04-03 14:15', utente: req.specialista, azione: 'Ordine fermo', dettaglio: 'Preventivo accettato dal cliente' }),
      timeline: [
        { step: 'Richiesta inserita', status: 'done' },
        { step: 'Valutazione', status: 'done' },
        { step: 'Invio al Broker', status: 'done' },
        { step: 'Quotazione', status: 'done' },
        { step: 'Ordine fermo', status: 'done' },
        { step: 'Pagamento', status: 'current' },
        { step: 'Emissione', status: 'todo' },
        { step: 'PRIT e archiviazione', status: 'todo' },
      ],
    });
  };

  const registerPayment = (id) => {
    const req = requests.find((r) => r.id === id);
    updateRequest(id, {
      stato: 'Pagata',
      fase: 'Attesa emissione polizza',
      pagamentoRicevuto: true,
      documenti: Array.from(new Set([...(req.documenti || []), 'Ricevuta pagamento'])),
      audit: appendAudit(req, { data: '2026-04-03 16:00', utente: req.broker, azione: 'Pagamento confermato', dettaglio: 'Bonifico ricevuto dal broker' }),
      timeline: [
        { step: 'Richiesta inserita', status: 'done' },
        { step: 'Valutazione', status: 'done' },
        { step: 'Invio al Broker', status: 'done' },
        { step: 'Quotazione', status: 'done' },
        { step: 'Ordine fermo', status: 'done' },
        { step: 'Pagamento', status: 'done' },
        { step: 'Emissione', status: 'current' },
        { step: 'PRIT e archiviazione', status: 'todo' },
      ],
    });
  };

  const issuePolicy = (id) => {
    const req = requests.find((r) => r.id === id);
    updateRequest(id, {
      stato: 'Emessa',
      fase: 'Archiviazione finale',
      polizzaEmessa: true,
      pritGenerato: true,
      archiviata: true,
      documenti: Array.from(new Set([...(req.documenti || []), 'Polizza firmata', 'PRIT'])),
      esito: 'Emissione completata',
      motivoEsito: 'Polizza emessa, inviata a rete/cliente e archiviata.',
      audit: appendAudit(req, { data: '2026-04-03 17:00', utente: 'Operations', azione: 'Polizza emessa', dettaglio: 'Emissione, PRIT e archiviazione completati' }),
      timeline: [
        { step: 'Richiesta inserita', status: 'done' },
        { step: 'Valutazione', status: 'done' },
        { step: 'Invio al Broker', status: 'done' },
        { step: 'Quotazione', status: 'done' },
        { step: 'Ordine fermo', status: 'done' },
        { step: 'Pagamento', status: 'done' },
        { step: 'Emissione', status: 'done' },
        { step: 'PRIT e archiviazione', status: 'done' },
      ],
    });
  };

  const submitNewRequest = () => {
    if (!newRequest.cliente || !newRequest.needs || !newRequest.firmatario) {
      alert('Compila almeno cliente, firmatario e bisogni del cliente.');
      return;
    }
    const nextId = `RB-2026-${String(requests.length + 1).padStart(3, '0')}`;
    const docs = [
      newRequest.documentiBase.privacy ? 'Privacy firmata' : null,
      newRequest.documentiBase.questionario ? 'Questionario rischio' : null,
      newRequest.documentiBase.visura ? 'Visura camerale' : null,
    ].filter(Boolean);
    const created = {
      id: nextId,
      cliente: newRequest.cliente,
      tipoCliente: newRequest.tipoCliente,
      partitaIva: newRequest.partitaIva,
      firmatario: newRequest.firmatario,
      poteriFirmaVerificati: newRequest.poteriFirmaVerificati,
      prodotto: newRequest.prodotto,
      ramo: newRequest.ramo,
      specialista: newRequest.specialista,
      areaCommerciale: newRequest.areaCommerciale || 'Da assegnare',
      dataInvio: '2026-04-03',
      stato: 'In valutazione',
      fase: 'Valutazione Bancassurance',
      premioStimato: newRequest.premioStimato || 'Da definire',
      needs: newRequest.needs,
      note: newRequest.note || '',
      targetMarket: 'Da verificare',
      privacyBMed: newRequest.privacyBMed,
      privacyBroker: false,
      dnFirmato: false,
      quotazioneRicevuta: false,
      pagamentoRicevuto: false,
      polizzaEmessa: false,
      pritGenerato: false,
      archiviata: false,
      broker: newRequest.broker,
      canaleInvio: newRequest.canaleInvio,
      documenti: docs,
      esito: '',
      motivoEsito: '',
      audit: [{ data: '2026-04-03 09:00', utente: newRequest.specialista, azione: 'Creazione pratica', dettaglio: 'Nuova richiesta inserita' }],
      timeline: [
        { step: 'Richiesta inserita', status: 'done' },
        { step: 'Valutazione', status: 'current' },
        { step: 'Invio al Broker', status: 'todo' },
        { step: 'Quotazione', status: 'todo' },
        { step: 'Ordine fermo', status: 'todo' },
        { step: 'Pagamento', status: 'todo' },
        { step: 'Emissione', status: 'todo' },
        { step: 'PRIT e archiviazione', status: 'todo' },
      ],
    };
    setRequests((prev) => [created, ...prev]);
    setSelectedId(created.id);
    setTab('workflow');
    setNewRequest({
      cliente: '',
      tipoCliente: 'Persona giuridica',
      partitaIva: '',
      firmatario: '',
      poteriFirmaVerificati: false,
      prodotto: 'Polizza Danni Azienda',
      ramo: 'Danni',
      specialista: 'Mario Specialista',
      areaCommerciale: '',
      broker: 'Broker Delta',
      canaleInvio: 'Digital Form',
      premioStimato: '',
      needs: '',
      note: '',
      privacyBMed: true,
      documentiBase: { questionario: true, visura: false, privacy: true },
    });
  };

  return (
    <div className="app-shell">
      <div className="page-header">
        <div>
          <div className="eyebrow">MVP WebApp · Versione 3</div>
          <h1>Gestione richieste emissione polizze broker</h1>
          <p className="subtitle">Workflow completo dalla richiesta iniziale fino a pagamento, emissione polizza, PRIT e archiviazione finale.</p>
        </div>
        <div className="card role-card">
          <div className="muted tiny">Profilo attivo</div>
          <select className="select-simple" value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Specialista</option>
            <option>Valutatore</option>
            <option>Bancassurance</option>
            <option>Operations</option>
            <option>Amministratore</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <IconStat title="Pratiche totali" value={stats.totali} hint="Workflow broker" icon={FileText} />
        <IconStat title="In valutazione" value={stats.inValutazione} hint="Verifica iniziale" icon={Clock3} />
        <IconStat title="Da integrare" value={stats.daIntegrare} hint="Documenti o dati mancanti" icon={AlertTriangle} />
        <IconStat title="Approvate" value={stats.approvate} hint="Pronte per broker" icon={CheckCircle2} />
        <IconStat title="Quotazioni" value={stats.quotazioni} hint="Ricevute dal broker" icon={Mail} />
        <IconStat title="Ordini fermi" value={stats.ordineFermo} hint="Pronte per pagamento" icon={ClipboardCheck} />
        <IconStat title="Pagate" value={stats.pagate} hint="Attesa emissione" icon={Receipt} />
        <IconStat title="Emesse" value={stats.emesse} hint="Chiuse e archiviate" icon={FolderArchive} />
      </div>

      <div className="tabs">
        {[
          ['workflow', 'Workflow operativo'],
          ['nuova', 'Nuova richiesta'],
          ['fase2', 'Workflow completo'],
          ['report', 'Report'],
          ['modello', 'Regole MVP'],
        ].map(([key, label]) => (
          <button key={key} className={`tab ${tab === key ? 'tab-active' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'workflow' && (
        <div className="workflow-layout">
          <div className="card sidebar-card">
            <div className="sidebar-top">
              <h3>Richieste</h3>
              <div className="search-box"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca..." /></div>
            </div>
            <select className="select-simple full" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>Tutti</option>
              <option>In valutazione</option>
              <option>Da integrare</option>
              <option>Approvata</option>
              <option>Quotazione ricevuta</option>
              <option>Ordine fermo</option>
              <option>Pagata</option>
              <option>Emessa</option>
              <option>Rifiutata</option>
            </select>
            <div className="request-list">
              {filteredRequests.map((req) => (
                <button key={req.id} className={`request-item ${selectedId === req.id ? 'request-item-active' : ''}`} onClick={() => setSelectedId(req.id)}>
                  <div className="request-top"><div><div className="strong">{req.cliente}</div><div className="muted tiny">{req.id} · {req.prodotto}</div></div><StatusBadge value={req.stato} /></div>
                  <div className="request-meta"><UserRound size={13} /> {req.specialista}</div>
                  <div className="request-meta"><Building2 size={13} /> {req.broker}</div>
                </button>
              ))}
            </div>
          </div>

          <RequestDetail
            request={selectedRequest}
            role={role}
            onApprove={approveRequest}
            onReject={rejectRequest}
            onIntegrate={integrateRequest}
            onSendToBroker={sendToBroker}
            onReceiveQuote={receiveQuote}
            onSetOrderFermo={setOrderFermo}
            onRegisterPayment={registerPayment}
            onIssuePolicy={issuePolicy}
          />
        </div>
      )}

      {tab === 'nuova' && <FormTab newRequest={newRequest} setNewRequest={setNewRequest} submitNewRequest={submitNewRequest} />}
      {tab === 'fase2' && <WorkflowOverview />}
      {tab === 'report' && <ManagementReport requests={requests} selectedRequest={selectedRequest} />}
      {tab === 'modello' && <RulesTab />}
    </div>
  );
}
