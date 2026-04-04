import React, { useEffect, useMemo, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAI3mikHgVMO4DM89lTvn7RsaSzO6w9414",
  authDomain: "broker-app-7bcba.firebaseapp.com",
  projectId: "broker-app-7bcba",
  storageBucket: "broker-app-7bcba.firebasestorage.app",
  messagingSenderId: "531343802963",
  appId: "1:531343802963:web:99e8ae9863bdc7b090bca6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const roles = ["Specialista", "Valutatore", "Bancassurance", "Operations", "Amministratore"];
const states = [
  "In valutazione",
  "Da integrare",
  "Approvata",
  "Quotazione ricevuta",
  "Ordine fermo",
  "Pagata",
  "Emessa",
  "Rifiutata",
];

const initialSeed = [
  {
    cliente: "Alfa Meccanica S.r.l.",
    tipoCliente: "Persona giuridica",
    partitaIva: "10456780962",
    firmatario: "Giulia Ferri",
    poteriFirmaVerificati: true,
    prodotto: "Polizza Danni Azienda",
    ramo: "Danni",
    specialista: "Marco Rossi",
    areaCommerciale: "Milano Nord",
    broker: "Broker Delta",
    canaleInvio: "Digital Form",
    premioStimato: "€ 4.500",
    needs: "Copertura incendio, furto, eventi atmosferici e RC verso terzi.",
    note: "Richiesta prioritaria per rinnovo con estensione garanzia eventi atmosferici.",
    targetMarket: "Coerente",
    privacyBMed: true,
    privacyBroker: false,
    dnFirmato: false,
    quotazioneRicevuta: false,
    pagamentoRicevuto: false,
    polizzaEmessa: false,
    pritGenerato: false,
    archiviata: false,
    stato: "In valutazione",
    fase: "Valutazione Bancassurance",
    esito: "",
    motivoEsito: "",
    createdAt: new Date().toISOString(),
    audit: [
      {
        data: new Date().toLocaleString("it-IT"),
        utente: "Sistema",
        azione: "Seed iniziale",
        dettaglio: "Pratica demo caricata",
      },
    ],
  },
];

const badgeStyles = {
  "In valutazione": { background: "#FEF3C7", color: "#92400E" },
  "Da integrare": { background: "#FFEDD5", color: "#9A3412" },
  Approvata: { background: "#DCFCE7", color: "#166534" },
  "Quotazione ricevuta": { background: "#EDE9FE", color: "#5B21B6" },
  "Ordine fermo": { background: "#CFFAFE", color: "#155E75" },
  Pagata: { background: "#ECFCCB", color: "#3F6212" },
  Emessa: { background: "#D1FAE5", color: "#065F46" },
  Rifiutata: { background: "#FEE2E2", color: "#991B1B" },
};

function getTimeline(request) {
  const steps = [
    "Richiesta inserita",
    "Valutazione",
    "Invio al Broker",
    "Quotazione",
    "Ordine fermo",
    "Pagamento",
    "Emissione",
    "PRIT e archiviazione",
  ];

  const currentIndexMap = {
    "In valutazione": 1,
    "Da integrare": 1,
    Approvata: 2,
    "Quotazione ricevuta": 4,
    "Ordine fermo": 5,
    Pagata: 6,
    Emessa: 8,
    Rifiutata: 1,
  };

  const current = currentIndexMap[request.stato] ?? 1;

  return steps.map((step, index) => ({
    step,
    status: index + 1 < current ? "done" : index + 1 === current ? "current" : "todo",
  }));
}

function Info({ label, value }) {
  return (
    <div style={styles.infoBox}>
      <div style={styles.label}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value || "—"}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ ...styles.label, marginBottom: 8 }}>{title}</div>
      <div style={styles.sectionBox}>{children}</div>
    </div>
  );
}

export default function App() {
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [role, setRole] = useState("Specialista");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tutti");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [form, setForm] = useState({
    cliente: "",
    tipoCliente: "Persona giuridica",
    partitaIva: "",
    firmatario: "",
    poteriFirmaVerificati: false,
    prodotto: "Polizza Danni Azienda",
    ramo: "Danni",
    specialista: "Mario Specialista",
    areaCommerciale: "",
    broker: "Broker Delta",
    canaleInvio: "Digital Form",
    premioStimato: "",
    needs: "",
    note: "",
    privacyBMed: true,
    privacyBroker: false,
    dnFirmato: false,
    quotazioneRicevuta: false,
  });

  useEffect(() => {
    const seedIfEmpty = async () => {
      const snapshot = await getDocs(collection(db, "richieste"));
      if (snapshot.empty) {
        for (const item of initialSeed) {
          await addDoc(collection(db, "richieste"), item);
        }
      }
    };
    seedIfEmpty();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "richieste"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRequests(rows);
      if (!selectedId && rows[0]) setSelectedId(rows[0].id);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedId]);

  const selected = requests.find((r) => r.id === selectedId) || null;

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const q = search.toLowerCase();
      const matchesText =
        (r.cliente || "").toLowerCase().includes(q) ||
        (r.prodotto || "").toLowerCase().includes(q) ||
        (r.specialista || "").toLowerCase().includes(q) ||
        (r.stato || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "Tutti" ? true : r.stato === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const stats = {
    totali: requests.length,
    inValutazione: requests.filter((r) => r.stato === "In valutazione").length,
    daIntegrare: requests.filter((r) => r.stato === "Da integrare").length,
    approvate: requests.filter((r) => r.stato === "Approvata").length,
    quotazioni: requests.filter((r) => r.stato === "Quotazione ricevuta").length,
    ordineFermo: requests.filter((r) => r.stato === "Ordine fermo").length,
    pagate: requests.filter((r) => r.stato === "Pagata").length,
    emesse: requests.filter((r) => r.stato === "Emessa").length,
  };

  async function updateWorkflow(request, patch, auditEntry) {
    const ref = doc(db, "richieste", request.id);
    const nextAudit = [...(request.audit || []), auditEntry];
    await updateDoc(ref, {
      ...patch,
      audit: nextAudit,
      updatedAt: serverTimestamp(),
    });
    setComment("");
  }

  async function createRequest() {
    if (!form.cliente || !form.firmatario || !form.needs) {
      alert("Compila almeno cliente, firmatario e bisogni del cliente.");
      return;
    }

    const payload = {
      ...form,
      stato: "In valutazione",
      fase: "Valutazione Bancassurance",
      targetMarket: "Da verificare",
      pagamentoRicevuto: false,
      polizzaEmessa: false,
      pritGenerato: false,
      archiviata: false,
      esito: "",
      motivoEsito: "",
      createdAt: new Date().toISOString(),
      audit: [
        {
          data: new Date().toLocaleString("it-IT"),
          utente: form.specialista,
          azione: "Creazione pratica",
          dettaglio: "Richiesta inserita da form",
        },
      ],
    };

    await addDoc(collection(db, "richieste"), payload);
    setSaveMessage("Richiesta salvata correttamente");
    setForm({
      cliente: "",
      tipoCliente: "Persona giuridica",
      partitaIva: "",
      firmatario: "",
      poteriFirmaVerificati: false,
      prodotto: "Polizza Danni Azienda",
      ramo: "Danni",
      specialista: "Mario Specialista",
      areaCommerciale: "",
      broker: "Broker Delta",
      canaleInvio: "Digital Form",
      premioStimato: "",
      needs: "",
      note: "",
      privacyBMed: true,
      privacyBroker: false,
      dnFirmato: false,
      quotazioneRicevuta: false,
    });
    setTimeout(() => setSaveMessage(""), 2500);
  }

  const kpiCards = [
    ["Pratiche totali", stats.totali],
    ["In valutazione", stats.inValutazione],
    ["Da integrare", stats.daIntegrare],
    ["Approvate", stats.approvate],
    ["Quotazioni", stats.quotazioni],
    ["Ordini fermi", stats.ordineFermo],
    ["Pagate", stats.pagate],
    ["Emesse", stats.emesse],
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>MVP WEBAPP · VERSIONE COMPLETA + FIREBASE</div>
            <h1 style={styles.title}>Gestione richieste emissione polizze broker</h1>
            <p style={styles.subtitle}>Workflow completo con dati reali salvati su Firestore.</p>
          </div>

          <div style={styles.roleBox}>
            <div style={styles.label}>Profilo attivo</div>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.select}>
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.kpiGrid}>
          {kpiCards.map(([label, value]) => (
            <div key={label} style={styles.kpiCard}>
              <div style={styles.kpiLabel}>{label}</div>
              <div style={styles.kpiValue}>{value}</div>
            </div>
          ))}
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.sidebar}>
            <div style={styles.cardTitle}>Richieste</div>

            <input
              style={styles.input}
              placeholder="Cerca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select style={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>Tutti</option>
              {states.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {loading ? (
                <div>Caricamento...</div>
              ) : (
                filtered.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    style={{
                      ...styles.requestItem,
                      borderColor: selectedId === r.id ? "#111827" : "#E5E7EB",
                      background: selectedId === r.id ? "#F8FAFC" : "white",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.cliente}</div>
                        <div style={styles.mutedSmall}>{r.prodotto}</div>
                      </div>
                      <span style={{ ...styles.badge, ...(badgeStyles[r.stato] || {}) }}>{r.stato}</span>
                    </div>
                    <div style={{ ...styles.mutedSmall, marginTop: 8 }}>
                      {r.specialista} · {r.broker}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div style={styles.detailArea}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Nuova richiesta</div>

              <div style={styles.formGrid}>
                <input
                  style={styles.input}
                  placeholder="Cliente"
                  value={form.cliente}
                  onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                />
                <input
                  style={styles.input}
                  placeholder="Firmatario"
                  value={form.firmatario}
                  onChange={(e) => setForm({ ...form, firmatario: e.target.value })}
                />
                <input
                  style={styles.input}
                  placeholder="P.IVA / CF"
                  value={form.partitaIva}
                  onChange={(e) => setForm({ ...form, partitaIva: e.target.value })}
                />
                <input
                  style={styles.input}
                  placeholder="Specialista"
                  value={form.specialista}
                  onChange={(e) => setForm({ ...form, specialista: e.target.value })}
                />
                <input
                  style={styles.input}
                  placeholder="Area commerciale"
                  value={form.areaCommerciale}
                  onChange={(e) => setForm({ ...form, areaCommerciale: e.target.value })}
                />
                <input
                  style={styles.input}
                  placeholder="Premio stimato"
                  value={form.premioStimato}
                  onChange={(e) => setForm({ ...form, premioStimato: e.target.value })}
                />

                <select
                  style={styles.select}
                  value={form.tipoCliente}
                  onChange={(e) => setForm({ ...form, tipoCliente: e.target.value })}
                >
                  <option>Persona giuridica</option>
                  <option>Persona fisica</option>
                </select>

                <select
                  style={styles.select}
                  value={form.prodotto}
                  onChange={(e) => setForm({ ...form, prodotto: e.target.value })}
                >
                  <option>Polizza Danni Azienda</option>
                  <option>Polizza Danni Commerciale</option>
                  <option>Polizza Professionale</option>
                  <option>Polizza Fabbricati</option>
                  <option>Polizza Casa</option>
                </select>

                <select
                  style={styles.select}
                  value={form.broker}
                  onChange={(e) => setForm({ ...form, broker: e.target.value })}
                >
                  <option>Broker Delta</option>
                  <option>Broker Sigma</option>
                  <option>Broker Omega</option>
                </select>

                <select
                  style={styles.select}
                  value={form.canaleInvio}
                  onChange={(e) => setForm({ ...form, canaleInvio: e.target.value })}
                >
                  <option>Digital Form</option>
                  <option>Email</option>
                  <option>PDF compilabile</option>
                </select>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={form.privacyBMed}
                    onChange={(e) => setForm({ ...form, privacyBMed: e.target.checked })}
                  />
                  Privacy BMed acquisita
                </label>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={form.poteriFirmaVerificati}
                    onChange={(e) => setForm({ ...form, poteriFirmaVerificati: e.target.checked })}
                  />
                  Poteri di firma verificati
                </label>
              </div>

              <textarea
                style={styles.textarea}
                placeholder="Bisogni del cliente / coperture richieste"
                value={form.needs}
                onChange={(e) => setForm({ ...form, needs: e.target.value })}
              />

              <textarea
                style={styles.textarea}
                placeholder="Note operative"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <button style={styles.primaryButton} onClick={createRequest}>
                  Salva richiesta
                </button>
                {saveMessage ? <span style={{ color: "#166534", fontWeight: 600 }}>{saveMessage}</span> : null}
              </div>
            </div>

            <div style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div style={styles.cardTitle}>Dettaglio pratica</div>
                {selected ? (
                  <span style={{ ...styles.badge, ...(badgeStyles[selected.stato] || {}) }}>{selected.stato}</span>
                ) : null}
              </div>

              {!selected ? (
                <div style={styles.mutedText}>Seleziona una pratica a sinistra.</div>
              ) : (
                <>
                  <div style={styles.detailGrid}>
                    <Info label="Cliente" value={selected.cliente} />
                    <Info label="Prodotto" value={selected.prodotto} />
                    <Info label="Specialista" value={selected.specialista} />
                    <Info label="Broker" value={selected.broker} />
                    <Info label="Firmatario" value={selected.firmatario} />
                    <Info label="P.IVA / CF" value={selected.partitaIva} />
                    <Info label="Premio stimato" value={selected.premioStimato || "—"} />
                    <Info label="Fase" value={selected.fase || "—"} />
                  </div>

                  <Section title="Bisogni del cliente">{selected.needs || "—"}</Section>
                  <Section title="Note operative">{selected.note || "—"}</Section>

                  <Section title="Workflow">
                    <div style={styles.timeline}>
                      {getTimeline(selected).map((item) => (
                        <div key={item.step} style={styles.timelineItem}>
                          <span
                            style={{
                              ...styles.timelineDot,
                              background:
                                item.status === "done"
                                  ? "#22C55E"
                                  : item.status === "current"
                                  ? "#F59E0B"
                                  : "#CBD5E1",
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.step}</div>
                            <div style={styles.mutedSmall}>
                              {item.status === "done"
                                ? "Completato"
                                : item.status === "current"
                                ? "Fase attuale"
                                : "Da eseguire"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section title="Audit trail">
                    <div style={{ display: "grid", gap: 8 }}>
                      {(selected.audit || [])
                        .slice()
                        .reverse()
                        .map((a, i) => (
                          <div key={i} style={styles.auditRow}>
                            <div style={{ fontWeight: 600 }}>{a.azione}</div>
                            <div style={styles.mutedSmall}>
                              {a.data} · {a.utente}
                            </div>
                            <div>{a.dettaglio}</div>
                          </div>
                        ))}
                    </div>
                  </Section>

                  <textarea
                    style={styles.textarea}
                    placeholder="Commento operativo / motivazione..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />

                  <div style={styles.actionBar}>
                    {(role === "Valutatore" || role === "Bancassurance") && selected.stato === "In valutazione" && (
                      <>
                        <button
                          style={styles.primaryButton}
                          onClick={() =>
                            updateWorkflow(
                              selected,
                              {
                                stato: "Approvata",
                                fase: "Pronta per invio a Broker",
                                esito: "OK",
                                motivoEsito: comment || "Pratica approvata",
                              },
                              {
                                data: new Date().toLocaleString("it-IT"),
                                utente: role,
                                azione: "Approvata",
                                dettaglio: comment || "Pratica approvata",
                              }
                            )
                          }
                        >
                          Approva
                        </button>

                        <button
                          style={styles.secondaryButton}
                          onClick={() =>
                            updateWorkflow(
                              selected,
                              {
                                stato: "Da integrare",
                                fase: "Attesa integrazione Specialista",
                                esito: "Integrazione richiesta",
                                motivoEsito: comment || "Dati mancanti",
                              },
                              {
                                data: new Date().toLocaleString("it-IT"),
                                utente: role,
                                azione: "Richiesta integrazione",
                                dettaglio: comment || "Dati mancanti",
                              }
                            )
                          }
                        >
                          Richiedi integrazione
                        </button>

                        <button
                          style={styles.dangerButton}
                          onClick={() =>
                            updateWorkflow(
                              selected,
                              {
                                stato: "Rifiutata",
                                fase: "Chiusa",
                                esito: "KO",
                                motivoEsito: comment || "Pratica rifiutata",
                              },
                              {
                                data: new Date().toLocaleString("it-IT"),
                                utente: role,
                                azione: "Rifiutata",
                                dettaglio: comment || "Pratica rifiutata",
                              }
                            )
                          }
                        >
                          Rifiuta
                        </button>
                      </>
                    )}

                    {(role === "Bancassurance" || role === "Amministratore") && selected.stato === "Approvata" && (
                      <>
                        <button
                          style={styles.secondaryButton}
                          onClick={() =>
                            updateWorkflow(
                              selected,
                              { fase: "Richiesta inviata al Broker" },
                              {
                                data: new Date().toLocaleString("it-IT"),
                                utente: role,
                                azione: "Invio al Broker",
                                dettaglio: comment || "Richiesta trasmessa al broker",
                              }
                            )
                          }
                        >
                          Invia al Broker
                        </button>

                        <button
                          style={styles.secondaryButton}
                          onClick={() =>
                            updateWorkflow(
                              selected,
                              {
                                stato: "Quotazione ricevuta",
                                fase: "Attesa accettazione preventivo",
                                privacyBroker: true,
                                quotazioneRicevuta: true,
                              },
                              {
                                data: new Date().toLocaleString("it-IT"),
                                utente: selected.broker,
                                azione: "Quotazione ricevuta",
                                dettaglio: comment || "Quotazione registrata",
                              }
                            )
                          }
                        >
                          Registra quotazione
                        </button>
                      </>
                    )}

                    {(role === "Bancassurance" || role === "Amministratore") &&
                      selected.stato === "Quotazione ricevuta" && (
                        <button
                          style={styles.primaryButton}
                          onClick={() =>
                            updateWorkflow(
                              selected,
                              {
                                stato: "Ordine fermo",
                                fase: "Attesa pagamento Broker",
                                dnFirmato: true,
                                esito: "Ordine fermo acquisito",
                                motivoEsito: comment || "Cliente ha accettato il preventivo",
                              },
                              {
                                data: new Date().toLocaleString("it-IT"),
                                utente: selected.specialista,
                                azione: "Ordine fermo",
                                dettaglio: comment || "Cliente ha accettato il preventivo",
                              }
                            )
                          }
                        >
                          Conferma ordine fermo
                        </button>
                      )}

                    {(role === "Operations" || role === "Amministratore") && selected.stato === "Ordine fermo" && (
                      <button
                        style={styles.secondaryButton}
                        onClick={() =>
                          updateWorkflow(
                            selected,
                            {
                              stato: "Pagata",
                              fase: "Attesa emissione polizza",
                              pagamentoRicevuto: true,
                            },
                            {
                              data: new Date().toLocaleString("it-IT"),
                              utente: selected.broker,
                              azione: "Pagamento confermato",
                              dettaglio: comment || "Bonifico ricevuto",
                            }
                          )
                        }
                      >
                        Registra pagamento
                      </button>
                    )}

                    {(role === "Operations" || role === "Amministratore") && selected.stato === "Pagata" && (
                      <button
                        style={styles.primaryButton}
                        onClick={() =>
                          updateWorkflow(
                            selected,
                            {
                              stato: "Emessa",
                              fase: "Archiviazione finale",
                              polizzaEmessa: true,
                              pritGenerato: true,
                              archiviata: true,
                              esito: "Emissione completata",
                              motivoEsito: comment || "Polizza emessa e archiviata",
                            },
                            {
                              data: new Date().toLocaleString("it-IT"),
                              utente: role,
                              azione: "Polizza emessa",
                              dettaglio: comment || "Polizza emessa e archiviata",
                            }
                          )
                        }
                      >
                        Emetti polizza
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F8FAFC",
    padding: 24,
    color: "#0F172A",
    fontFamily: "Inter, Arial, sans-serif",
  },
  container: { maxWidth: 1400, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 20 },
  eyebrow: { fontSize: 12, letterSpacing: 1.5, color: "#64748B", fontWeight: 700 },
  title: { fontSize: 42, lineHeight: 1.1, margin: "8px 0" },
  subtitle: { color: "#475569", marginTop: 0 },
  roleBox: { background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 14, minWidth: 220 },
  label: { fontSize: 12, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 },
  select: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #CBD5E1",
    padding: "10px 12px",
    fontSize: 14,
    background: "white",
  },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(8, minmax(0, 1fr))", gap: 12, marginBottom: 20 },
  kpiCard: { background: "white", border: "1px solid #E5E7EB", borderRadius: 18, padding: 16, minHeight: 88 },
  kpiLabel: { color: "#64748B", fontSize: 13, marginBottom: 8 },
  kpiValue: { fontSize: 30, fontWeight: 700 },
  mainGrid: { display: "grid", gridTemplateColumns: "340px 1fr", gap: 18 },
  sidebar: { background: "white", border: "1px solid #E5E7EB", borderRadius: 18, padding: 16, height: "fit-content" },
  detailArea: { display: "grid", gap: 18 },
  card: { background: "white", border: "1px solid #E5E7EB", borderRadius: 18, padding: 18 },
  cardTitle: { fontSize: 20, fontWeight: 700, marginBottom: 14 },
  input: {
    borderRadius: 12,
    border: "1px solid #CBD5E1",
    padding: "10px 12px",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    borderRadius: 12,
    border: "1px solid #CBD5E1",
    padding: 12,
    fontSize: 14,
    width: "100%",
    minHeight: 90,
    boxSizing: "border-box",
    marginTop: 12,
  },
  requestItem: { border: "1px solid #E5E7EB", borderRadius: 16, padding: 14, textAlign: "left", cursor: "pointer" },
  mutedSmall: { color: "#64748B", fontSize: 12 },
  mutedText: { color: "#64748B" },
  badge: { display: "inline-block", borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginBottom: 12 },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 },
  infoBox: { background: "#F8FAFC", borderRadius: 14, padding: 12, border: "1px solid #E5E7EB" },
  sectionBox: { background: "#F8FAFC", borderRadius: 14, padding: 14, border: "1px solid #E5E7EB" },
  timeline: { display: "grid", gap: 10 },
  timelineItem: { display: "flex", gap: 10, alignItems: "flex-start" },
  timelineDot: { width: 12, height: 12, borderRadius: 999, marginTop: 4, flex: "0 0 auto" },
  auditRow: { background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 10 },
  actionBar: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 },
  primaryButton: { background: "#111827", color: "white", border: "none", borderRadius: 12, padding: "10px 14px", fontWeight: 700, cursor: "pointer" },
  secondaryButton: { background: "#E2E8F0", color: "#0F172A", border: "none", borderRadius: 12, padding: "10px 14px", fontWeight: 700, cursor: "pointer" },
  dangerButton: { background: "#DC2626", color: "white", border: "none", borderRadius: 12, padding: "10px 14px", fontWeight: 700, cursor: "pointer" },
};
