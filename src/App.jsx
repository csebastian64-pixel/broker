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
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAI3mikHgVMO4DM89lTvn7RsaSzO6w94l4",
  authDomain: "broker-app-7bcba.firebaseapp.com",
  projectId: "broker-app-7bcba",
  storageBucket: "broker-app-7bcba.firebasestorage.app",
  messagingSenderId: "531343802963",
  appId: "1:531343802963:web:99e8ae9863bdc7b090bca6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

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

function StatusBadge({ value }) {
  return (
    <span style={{ ...styles.badge, ...(badgeStyles[value] || { background: "#E5E7EB", color: "#111827" }) }}>
      {value}
    </span>
  );
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

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Login non riuscito: " + err.code);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.loginPage}>
      <div style={styles.loginCard}>
        <div style={styles.eyebrow}>ACCESSO RISERVATO</div>
        <h1 style={{ marginTop: 8, marginBottom: 8 }}>Broker App</h1>
        <p style={{ color: "#475569", marginTop: 0 }}>
          Accedi con l’utente creato in Firebase Authentication.
        </p>

        <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button style={styles.primaryButton} type="submit" disabled={busy}>
            {busy ? "Accesso..." : "Accedi"}
          </button>
          {error ? <div style={{ color: "#B91C1C", fontWeight: 600 }}>{error}</div> : null}
        </form>
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.tabButton,
        background: active ? "white" : "#E2E8F0",
        color: active ? "#111827" : "#475569",
      }}
    >
      {label}
    </button>
  );
}

function KpiCard({ label, value }) {
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiLabel}>{label}</div>
      <div style={styles.kpiValue}>{value}</div>
    </div>
  );
}

function WorkflowApp({ user }) {
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [role, setRole] = useState("Specialista");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tutti");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTab, setActiveTab] = useState("workflow");
  const [quotazioneFile, setQuotazioneFile] = useState(null);
  const [numeroPolizza, setNumeroPolizza] = useState("");
  const [premioTotale, setPremioTotale] = useState("");
  const [dataEffetto, setDataEffetto] = useState("");
  const [contraenteQuotazione, setContraenteQuotazione] = useState("");
  const [urlFileQuotazione, setUrlFileQuotazione] = useState("");
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
      if (!selectedId && rows[0]) {
        setSelectedId(rows[0].id);
      }
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

const chartData = [
  { label: "In valutazione", value: stats.inValutazione },
  { label: "Da integrare", value: stats.daIntegrare },
  { label: "Approvate", value: stats.approvate },
  { label: "Quotazioni", value: stats.quotazioni },
  { label: "Ordini fermi", value: stats.ordineFermo },
  { label: "Pagate", value: stats.pagate },
  { label: "Emesse", value: stats.emesse },
];

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
      createdBy: user.email,
      audit: [
        {
          data: new Date().toLocaleString("it-IT"),
          utente: form.specialista,
          azione: "Creazione pratica",
          dettaglio: `Richiesta inserita da form (${user.email})`,
        },
      ],
    };

    await addDoc(collection(db, "richieste"), payload);

    setSaveMessage("Richiesta salvata correttamente");
    setActiveTab("workflow");
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

async function salvaQuotazione(request) {
  let downloadUrl = "";
  let nomeFile = "";

  if (quotazioneFile) {
    nomeFile = quotazioneFile.name;
    const safeName = `${Date.now()}_${quotazioneFile.name}`;
    const fileRef = storageRef(storage, `quotazioni/${request.id}/${safeName}`);

    await uploadBytes(fileRef, quotazioneFile);
    downloadUrl = await getDownloadURL(fileRef);
  }

  await updateWorkflow(
    request,
    {
      stato: "Quotazione ricevuta",
      fase: "Attesa accettazione preventivo",
      quotazioneRicevuta: true,
      numeroPolizza: numeroPolizza || "",
      contraenteQuotazione: contraenteQuotazione || "",
      premioTotale: premioTotale || "",
      dataEffettoPolizza: dataEffetto || "",
      nomeFileQuotazione: nomeFile || "",
      urlFileQuotazione: downloadUrl || "",
    },
    {
      data: new Date().toLocaleString("it-IT"),
      utente: role,
      azione: "Quotazione caricata",
      dettaglio: `File: ${nomeFile || "nessun file"} - Polizza: ${numeroPolizza || "-"}`,
    }
  );

  setQuotazioneFile(null);
  setUrlFileQuotazione("");
  setNumeroPolizza("");
  setContraenteQuotazione("");
  setPremioTotale("");
  setDataEffetto("");
}

function parseQuotazioneText(text) {
  const cleanText = text.replace(/\s+/g, " ").trim();

  const numeroPolizzaMatch =
    cleanText.match(/Polizza\s*n\.\s*([0-9.]+)/i) ||
    cleanText.match(/Numero\s+([0-9.]+)/i);

  const contraenteMatch =
    cleanText.match(/Contraente\s+([A-ZÀ-Ú\s'.-]+?)\s+Codice fiscale/i) ||
    cleanText.match(/Ragione\s+Sociale\s+([A-Z0-9\s'.&-]+?)\s+Partita\s+Iva/i);

  const premioTotaleMatch =
    cleanText.match(/Totale\s+€\s*([\d.,]+)(?:\s+all'anno)?/i) ||
    cleanText.match(/Attiva\s+Totale\s+€\s*([\d.,]+)/i) ||
    cleanText.match(/PREMIO\s+ALLA\s+FIRMA.*?Totale\s+€\s*([\d.,]+)/i);

  const dataEffettoMatch =
    cleanText.match(/decorre\s+dalle\s+ore\s+\d{1,2}\s+del\s+(\d{2}\/\d{2}\/\d{4})/i) ||
    cleanText.match(/Effetto\s+Ore\s+\d{1,2}:\d{2}\s+del\s+(\d{2}\/\d{2}\/\d{4})/i);

  return {
    numeroPolizza: numeroPolizzaMatch ? numeroPolizzaMatch[1].trim() : "",
    contraente: contraenteMatch ? contraenteMatch[1].trim() : "",
    premioTotale: premioTotaleMatch ? premioTotaleMatch[1].trim() : "",
    dataEffetto: dataEffettoMatch ? convertItalianDateToInput(dataEffettoMatch[1]) : "",
  };
}

async function extractTextFromPdf(file) {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += " " + pageText;
  }

  return fullText;
}

async function handleQuotazioneFileChange(file) {
  setQuotazioneFile(file);
  if (!file) {
     setUrlFileQuotazione("");
     return;
   }

  setUrlFileQuotazione(URL.createObjectURL(file));

  try {
    const text = await extractTextFromPdf(file);
    console.log("TESTO PDF:", text);
  
    const parsed = parseQuotazioneText(text);
    console.log("PARSED PDF:", parsed);
  

    if (parsed.numeroPolizza) setNumeroPolizza(parsed.numeroPolizza);
    if (parsed.contraente) setContraenteQuotazione(parsed.contraente);
    if (parsed.premioTotale) setPremioTotale(parsed.premioTotale);
    if (parsed.dataEffetto) setDataEffetto(parsed.dataEffetto);
  } catch (error) {
    console.error("Errore parsing PDF:", error);
    alert("Non sono riuscito a leggere automaticamente il PDF. Puoi comunque compilare i campi a mano.");
  }
}

function convertItalianDateToInput(dateStr) {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}
function applicaParsingDemo() {
  const sampleText = `
    Numero 617.047.0000901101
    CONTRAENTE
    Ragione Sociale SCAINT SRL
    Partita Iva 02130561000
    Effetto Ore 24:00 del 23/11/2025
    PREMIO ALLA FIRMA
    Imponibile € 322,27 Imposte € 71,73 Totale € 394,00
  `;

  const parsed = parseQuotazioneText(sampleText);

  setNumeroPolizza(parsed.numeroPolizza);
  setContraenteQuotazione(parsed.contraente);
  setPremioTotale(parsed.premioTotale);
  setDataEffetto(parsed.dataEffetto);
}

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>MVP WEBAPP · VERSIONE CON MENU ORIZZONTALE</div>
            <h1 style={styles.title}>Gestione richieste emissione polizze broker</h1>
            <p style={styles.subtitle}>Login e database invariati, menu riorganizzato in schede orizzontali.</p>
          </div>

          <div style={styles.roleBox}>
            <div style={styles.label}>Utente</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{user.email}</div>
            <div style={styles.label}>Profilo attivo</div>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.select}>
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <button style={{ ...styles.secondaryButton, width: "100%", marginTop: 12 }} onClick={() => signOut(auth)}>
              Logout
            </button>
          </div>
        </div>

        
        <div style={styles.tabsBar}>
	  <TabButton label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <TabButton label="Workflow operativo" active={activeTab === "workflow"} onClick={() => setActiveTab("workflow")} />
          <TabButton label="Nuova richiesta" active={activeTab === "nuova"} onClick={() => setActiveTab("nuova")} />
          <TabButton label="Workflow completo" active={activeTab === "completo"} onClick={() => setActiveTab("completo")} />
          <TabButton label="Report" active={activeTab === "report"} onClick={() => setActiveTab("report")} />
          <TabButton label="Regole MVP" active={activeTab === "regole"} onClick={() => setActiveTab("regole")} />
        </div>

{activeTab === "dashboard" && (
  <div style={styles.dashboardGrid}>
    <div style={styles.card}>
      <div style={styles.cardTitle}>Dashboard</div>
      <div style={styles.kpiGridDashboard}>
        <KpiCard label="Pratiche totali" value={stats.totali} />
        <KpiCard label="In valutazione" value={stats.inValutazione} />
        <KpiCard label="Da integrare" value={stats.daIntegrare} />
        <KpiCard label="Approvate" value={stats.approvate} />
        <KpiCard label="Quotazioni" value={stats.quotazioni} />
        <KpiCard label="Ordini fermi" value={stats.ordineFermo} />
        <KpiCard label="Pagate" value={stats.pagate} />
        <KpiCard label="Emesse" value={stats.emesse} />
      </div>
<div style={{ marginTop: 20 }}>
    <div style={styles.cardTitle}>Ultime pratiche</div>

    <div style={{ display: "grid", gap: 10 }}>
     {requests.slice(0, 5).map((item) => (
       <button
         key={item.id}
         type="button"
         style={styles.latestItem}
         onClick={() => {
           setSelectedId(item.id);
           setActiveTab("workflow");
         }}
       >
   	 <div>
          <div style={{ fontWeight: 700 }}>{item.cliente}</div>
          <div style={styles.mutedSmall}>
            {item.prodotto} · {item.specialista}
          </div>
        </div>

          <div style={{ textAlign: "right" }}>
            <StatusBadge value={item.stato} />
            <div style={{ ...styles.mutedSmall, marginTop: 6 }}>
              {item.fase || "—"}
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
</div>
    
    <div style={styles.card}>
      <div style={styles.cardTitle}>Sintesi operativa</div>
      <div style={{ display: "grid", gap: 12 }}>
        <div style={styles.kpiMini}>
          <div style={styles.kpiLabel}>Backlog operativo</div>
          <div style={styles.kpiValueSmall}>
            {stats.inValutazione + stats.approvate + stats.quotazioni + stats.pagate}
          </div>
        </div>


<div style={styles.card}>
  <div style={styles.cardTitle}>Stato pratiche</div>

  <div style={{ display: "grid", gap: 12 }}>
    {chartData.map((item) => {
      const maxValue = Math.max(...chartData.map((d) => d.value), 1);
      const widthPercent = (item.value / maxValue) * 100;

      return (
        <div key={item.label} style={styles.chartRow}>
          <div style={styles.chartLabel}>{item.label}</div>

          <div style={styles.chartBarWrap}>
            <div
              style={{
                ...styles.chartBar,
                width: `${widthPercent}%`,
              }}
            />
          </div>

          <div style={styles.chartValue}>{item.value}</div>
        </div>
      );
    })}
  </div>
</div>

        <div style={styles.kpiMini}>
          <div style={styles.kpiLabel}>Pratiche bloccate</div>
          <div style={styles.kpiValueSmall}>
            {stats.daIntegrare + stats.ordineFermo}
          </div>
        </div>

        <div style={styles.kpiMini}>
          <div style={styles.kpiLabel}>Tasso emissione</div>
          <div style={styles.kpiValueSmall}>
            {stats.totali ? Math.round((stats.emesse / stats.totali) * 100) : 0}%
          </div>
        </div>
      </div>
    </div>
  </div>
)}
        
        {activeTab === "workflow" && (
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
                        <StatusBadge value={r.stato} />
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
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div style={styles.cardTitle}>Dettaglio pratica</div>
                  {selected ? <StatusBadge value={selected.stato} /> : null}
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
{selected.quotazioneRicevuta && (
  <div style={styles.card}>
    <div style={styles.cardTitle}>Quotazione</div>

    <div style={{ display: "grid", gap: 8 }}>
      <div>
        <b>Numero polizza:</b> {selected.numeroPolizza || "-"}
      </div>

      <div>
        <b>Premio totale:</b> {selected.premioTotale || "-"}
      </div>

      <div>
        <b>Data effetto:</b> {selected.dataEffettoPolizza || "-"}
      </div>

      <div>
         <b>File:</b>{" "}
        {selected.urlFileQuotazione ? (
          <a
            href={selected.urlFileQuotazione}
            target="_blank"
            rel="noreferrer"
          >
            {selected.nomeFileQuotazione || "Apri file"}
          </a>
        ) : (
          selected.nomeFileQuotazione || "-"
        )}
      </div>
    </div>
  </div>
)}	
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
                                { stato: "Approvata", fase: "Pronta per invio a Broker", esito: "OK", motivoEsito: comment || "Pratica approvata" },
                                { data: new Date().toLocaleString("it-IT"), utente: role, azione: "Approvata", dettaglio: comment || "Pratica approvata" }
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
                                { stato: "Da integrare", fase: "Attesa integrazione Specialista", esito: "Integrazione richiesta", motivoEsito: comment || "Dati mancanti" },
                                { data: new Date().toLocaleString("it-IT"), utente: role, azione: "Richiesta integrazione", dettaglio: comment || "Dati mancanti" }
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
                                { stato: "Rifiutata", fase: "Chiusa", esito: "KO", motivoEsito: comment || "Pratica rifiutata" },
                                { data: new Date().toLocaleString("it-IT"), utente: role, azione: "Rifiutata", dettaglio: comment || "Pratica rifiutata" }
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
                                { data: new Date().toLocaleString("it-IT"), utente: role, azione: "Invio al Broker", dettaglio: comment || "Richiesta trasmessa al broker" }
                              )
                            }
                          >
                            Invia al Broker
                          </button>

<div style={styles.uploadBox}>
  <div style={styles.label}>Carica preventivo / quotazione</div>

  <input
    type="file"
    accept="application/pdf"
    onChange={(e) => handleQuotazioneFileChange(e.target.files?.[0] || null)}
  />

  <input
    style={styles.input}
    placeholder="Numero polizza"
    value={numeroPolizza}
    onChange={(e) => setNumeroPolizza(e.target.value)}
  />

<input
  style={styles.input}
  placeholder="Contraente"
  value={contraenteQuotazione}
  onChange={(e) => setContraenteQuotazione(e.target.value)}
/>

  <input
    style={styles.input}
    placeholder="Premio totale"
    value={premioTotale}
    onChange={(e) => setPremioTotale(e.target.value)}
  />

  <input
    style={styles.input}
    type="date"
    value={dataEffetto}
    onChange={(e) => setDataEffetto(e.target.value)}
  />

  <button
    style={styles.secondaryButton}
    onClick={() => salvaQuotazione(selected)}
  >
    Salva quotazione
  </button>
</div>
                         
                        </>
                      )}

                      {(role === "Bancassurance" || role === "Amministratore") && selected.stato === "Quotazione ricevuta" && (
                        <button
                          style={styles.primaryButton}
                          onClick={() =>
                            updateWorkflow(
                              selected,
                              { stato: "Ordine fermo", fase: "Attesa pagamento Broker", dnFirmato: true, esito: "Ordine fermo acquisito", motivoEsito: comment || "Cliente ha accettato il preventivo" },
                              { data: new Date().toLocaleString("it-IT"), utente: selected.specialista, azione: "Ordine fermo", dettaglio: comment || "Cliente ha accettato il preventivo" }
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
                              { stato: "Pagata", fase: "Attesa emissione polizza", pagamentoRicevuto: true },
                              { data: new Date().toLocaleString("it-IT"), utente: selected.broker, azione: "Pagamento confermato", dettaglio: comment || "Bonifico ricevuto" }
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
                              { stato: "Emessa", fase: "Archiviazione finale", polizzaEmessa: true, pritGenerato: true, archiviata: true, esito: "Emissione completata", motivoEsito: comment || "Polizza emessa e archiviata" },
                              { data: new Date().toLocaleString("it-IT"), utente: role, azione: "Polizza emessa", dettaglio: comment || "Polizza emessa e archiviata" }
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
        )}

        {activeTab === "nuova" && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>Nuova richiesta</div>
            <div style={styles.formGrid}>
              <input style={styles.input} placeholder="Cliente" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} />
              <input style={styles.input} placeholder="Firmatario" value={form.firmatario} onChange={(e) => setForm({ ...form, firmatario: e.target.value })} />
              <input style={styles.input} placeholder="P.IVA / CF" value={form.partitaIva} onChange={(e) => setForm({ ...form, partitaIva: e.target.value })} />
              <input style={styles.input} placeholder="Specialista" value={form.specialista} onChange={(e) => setForm({ ...form, specialista: e.target.value })} />
              <input style={styles.input} placeholder="Area commerciale" value={form.areaCommerciale} onChange={(e) => setForm({ ...form, areaCommerciale: e.target.value })} />
              <input style={styles.input} placeholder="Premio stimato" value={form.premioStimato} onChange={(e) => setForm({ ...form, premioStimato: e.target.value })} />

              <select style={styles.select} value={form.tipoCliente} onChange={(e) => setForm({ ...form, tipoCliente: e.target.value })}>
                <option>Persona giuridica</option>
                <option>Persona fisica</option>
              </select>

              <select style={styles.select} value={form.prodotto} onChange={(e) => setForm({ ...form, prodotto: e.target.value })}>
                <option>Polizza Danni Azienda</option>
                <option>Polizza Danni Commerciale</option>
                <option>Polizza Professionale</option>
                <option>Polizza Fabbricati</option>
                <option>Polizza Casa</option>
              </select>

              <select style={styles.select} value={form.broker} onChange={(e) => setForm({ ...form, broker: e.target.value })}>
                <option>Broker Delta</option>
                <option>Broker Sigma</option>
                <option>Broker Omega</option>
              </select>

              <select style={styles.select} value={form.canaleInvio} onChange={(e) => setForm({ ...form, canaleInvio: e.target.value })}>
                <option>Digital Form</option>
                <option>Email</option>
                <option>PDF compilabile</option>
              </select>

              <label style={styles.checkboxRow}>
                <input type="checkbox" checked={form.privacyBMed} onChange={(e) => setForm({ ...form, privacyBMed: e.target.checked })} />
                Privacy BMed acquisita
              </label>

              <label style={styles.checkboxRow}>
                <input type="checkbox" checked={form.poteriFirmaVerificati} onChange={(e) => setForm({ ...form, poteriFirmaVerificati: e.target.checked })} />
                Poteri di firma verificati
              </label>
            </div>

            <textarea style={styles.textarea} placeholder="Bisogni del cliente / coperture richieste" value={form.needs} onChange={(e) => setForm({ ...form, needs: e.target.value })} />
            <textarea style={styles.textarea} placeholder="Note operative" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <button style={styles.primaryButton} onClick={createRequest}>Salva richiesta</button>
              {saveMessage ? <span style={{ color: "#166534", fontWeight: 600 }}>{saveMessage}</span> : null}
            </div>
          </div>
        )}

        {activeTab === "completo" && (
          <div style={styles.twoColGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Workflow completo</div>
              <div style={styles.pipelineGrid}>
                {["Richiesta", "Valutazione", "Broker", "Quotazione", "Ordine fermo", "Pagamento", "Emissione", "Archiviazione"].map((step, idx) => (
                  <div key={step} style={styles.pipelineCard}>
                    <div style={styles.mutedSmall}>Fase {idx + 1}</div>
                    <div style={{ fontWeight: 700, marginTop: 6 }}>{step}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Matrice ruoli</div>
              <div style={{ display: "grid", gap: 12 }}>
                <div><strong>Specialista</strong>: inserisce richieste e segue la pratica.</div>
                <div><strong>Valutatore</strong>: approva / rifiuta / richiede integrazione.</div>
                <div><strong>Bancassurance</strong>: invio broker, quotazione, ordine fermo.</div>
                <div><strong>Operations</strong>: pagamento, emissione, PRIT, archiviazione.</div>
                <div><strong>Amministratore</strong>: supervisione completa.</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "report" && (
          <div style={styles.twoColGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Vista management pratiche</div>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Cliente</th>
                      <th style={styles.th}>Specialista</th>
                      <th style={styles.th}>Broker</th>
                      <th style={styles.th}>Stato</th>
                      <th style={styles.th}>Fase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td style={styles.td}>{r.cliente}</td>
                        <td style={styles.td}>{r.specialista}</td>
                        <td style={styles.td}>{r.broker}</td>
                        <td style={styles.td}><StatusBadge value={r.stato} /></td>
                        <td style={styles.td}>{r.fase}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>KPI workflow</div>
              <div style={{ display: "grid", gap: 12 }}>
                <div style={styles.kpiMini}>
                  <div style={styles.kpiLabel}>Tasso pratiche concluse</div>
                  <div style={styles.kpiValueSmall}>{stats.totali ? Math.round((stats.emesse / stats.totali) * 100) : 0}%</div>
                </div>
                <div style={styles.kpiMini}>
                  <div style={styles.kpiLabel}>Pratiche bloccate</div>
                  <div style={styles.kpiValueSmall}>{stats.daIntegrare + stats.ordineFermo}</div>
                </div>
                <div style={styles.kpiMini}>
                  <div style={styles.kpiLabel}>Backlog operativo</div>
                  <div style={styles.kpiValueSmall}>{stats.inValutazione + stats.approvate + stats.quotazioni + stats.pagate}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "regole" && (
          <div style={styles.twoColGrid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Regole MVP</div>
              <div style={{ display: "grid", gap: 12 }}>
                <div>Accesso consentito solo a utenti autenticati Firebase.</div>
                <div>Database Firestore già collegato.</div>
                <div>Workflow tracciato con audit trail sulla pratica.</div>
                <div>Menu organizzato in tab orizzontali per una navigazione più chiara.</div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Utente corrente</div>
              <div style={{ display: "grid", gap: 10 }}>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Ruolo selezionato:</strong> {role}</div>
                <div><strong>Stato app:</strong> online con login e database</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return <div style={styles.loadingPage}>Caricamento...</div>;
  }

  if (user === null) {
    return <LoginScreen />;
  }

  return <WorkflowApp user={user} />;
}

const styles = {
  loadingPage: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#F8FAFC",
    fontFamily: "Inter, Arial, sans-serif",
    fontSize: 20,
    color: "#334155",
  },
  loginPage: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#F8FAFC",
    padding: 24,
    fontFamily: "Inter, Arial, sans-serif",
  },
  loginCard: {
    width: "100%",
    maxWidth: 420,
    background: "white",
    border: "1px solid #E5E7EB",
    borderRadius: 20,
    padding: 24,
    boxSizing: "border-box",
  },
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
  roleBox: { background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 14, minWidth: 260 },
  label: { fontSize: 12, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 },
  select: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #CBD5E1",
    padding: "10px 12px",
    fontSize: 14,
    background: "white",
  },
  tabsBar: {
    display: "flex",
    gap: "10px",
    background: "#E2E8F0",
    padding: 8,
    borderRadius: 16,
    marginBottom: 18,
    flexWrap: "nowrap",
    overflowX: "auto",
    whiteSpace: "nowrap",
  },
  tabButton: {
    border: "none",
    borderRadius: 12,
    padding: "12px 10px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  },

uploadBox: {
  display: "grid",
  gap: 10,
  marginTop: 10,
  padding: 12,
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  background: "#F8FAFC",
},

latestItem: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  padding: 14,
  border: "1px solid #E5E7EB",
  borderRadius: 14,
  background: "#FFFFFF",
  width: "100%",
  textAlign: "left",
  cursor: "pointer",
},

chartRow: {
  display: "grid",
  gridTemplateColumns: "160px 1fr 40px",
  gap: 12,
  alignItems: "center",
},

chartLabel: {
  fontSize: 14,
  color: "#334155",
  fontWeight: 600,
},

chartBarWrap: {
  width: "100%",
  height: 14,
  background: "#E2E8F0",
  borderRadius: 999,
  overflow: "hidden",
},

chartBar: {
  height: "100%",
  background: "#0F172A",
  borderRadius: 999,
},

chartValue: {
  fontSize: 14,
  fontWeight: 700,
  color: "#0F172A",
  textAlign: "right",
},
dashboardGrid: {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: 18,
},

kpiGridDashboard: {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 12,
},
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(8, minmax(0, 1fr))", gap: 12, marginBottom: 20 },
  kpiCard: { background: "white", border: "1px solid #E5E7EB", borderRadius: 18, padding: 16, minHeight: 88 },
  kpiLabel: { color: "#64748B", fontSize: 13, marginBottom: 8 },
  kpiValue: { fontSize: 30, fontWeight: 700 },
  kpiValueSmall: { fontSize: 26, fontWeight: 700 },
  kpiMini: { background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #E5E7EB" },
  mainGrid: { display: "grid", gridTemplateColumns: "340px 1fr", gap: 18 },
  twoColGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 },
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
  pipelineGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 },
  pipelineCard: { background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 14, padding: 14, textAlign: "center" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #E5E7EB", color: "#64748B", fontSize: 13 },
  td: { padding: "10px 8px", borderBottom: "1px solid #F1F5F9", verticalAlign: "top" },
};
