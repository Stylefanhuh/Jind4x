import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- CONFIGURACIÓN DE ACCESO ---
// Configura aquí la contraseña que tendrán que ingresar para entrar a la web
const GATE_PASSWORD = 'jind4x_smp';

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDJxL357zUH-gOw8PEbn1ddnfc6N9umgJk",
  authDomain: "jind4x-multiverse.firebaseapp.com",
  projectId: "jind4x-multiverse",
  storageBucket: "jind4x-multiverse.appspot.com",
  messagingSenderId: "860901859339",
  appId: "1:860901859339:web:9b5dad71658a166ba6238e",
  measurementId: "G-BMNFXXJV6J"
};

const isFirebaseConfigured = firebaseConfig.projectId && firebaseConfig.projectId !== "TU_PROJECT_ID";
let db = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🔥 Firebase inicializado con éxito.");
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
  }
} else {
  console.warn("⚠️ Firebase no configurado. Iniciando en Modo Simulación local.");
}

document.addEventListener('DOMContentLoaded', () => {
  const SERVER_IP = 'Va104.holy.gg:19524';
  
  // Gate DOM Elements
  const body = document.body;
  const gate = document.getElementById('registration-gate');
  const gateForm = document.getElementById('smp-gate-form');
  const gateBtnSubmit = document.getElementById('btn-gate-submit');
  const gateSpinner = document.getElementById('gate-spinner');
  const gateStatusSuccess = document.getElementById('gate-status-success');
  const gateStatusError = document.getElementById('gate-status-error');
  const mainContent = document.getElementById('main-content');
  
  // Feed & standard page elements
  const feedContainer = document.getElementById('players-list-feed');
  const registrationCard = document.querySelector('.register-card');

  // --- CHECK EXISTING LOGIN/REGISTRATION STATE ---
  const storedIGN = localStorage.getItem('jind4x_ign');
  const storedPlatform = localStorage.getItem('jind4x_platform');

  if (storedIGN && storedPlatform) {
    unlockSite();
    showRegisteredProfile(storedIGN, storedPlatform);
  } else {
    lockSite();
  }

  function lockSite() {
    body.classList.add('locked');
    mainContent.classList.add('blurred');
    gate.classList.remove('unlocked');
  }

  function unlockSite() {
    body.classList.remove('locked');
    mainContent.classList.remove('blurred');
    gate.classList.add('unlocked');
  }

  // --- GATE REGISTRATION FORM SUBMIT ---
  if (gateForm) {
    gateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      gateStatusSuccess.style.display = 'none';
      gateStatusError.style.display = 'none';
      
      if (!validateGateForm()) return;
      
      setGateLoading(true);
      const ign = document.getElementById('gate-ign-input').value.trim();
      const platform = document.getElementById('gate-platform-input').value;
      const discord = document.getElementById('gate-discord-input').value.trim();

      const registrationData = {
        ign: ign,
        plataforma: platform,
        discord: discord || 'No provisto',
        timestamp: isFirebaseConfigured && db ? serverTimestamp() : new Date().toISOString()
      };

      try {
        if (isFirebaseConfigured && db) {
          await addDoc(collection(db, "registros"), registrationData);
        } else {
          // Local storage simulation
          await new Promise(r => setTimeout(r, 800));
          const records = JSON.parse(localStorage.getItem('jind4x_logs') || '[]');
          records.push({ ign, plataforma: platform });
          localStorage.setItem('jind4x_logs', JSON.stringify(records));
        }

        // Save state locally
        localStorage.setItem('jind4x_ign', ign);
        localStorage.setItem('jind4x_platform', platform);
        
        gateStatusSuccess.style.display = 'flex';
        
        setTimeout(() => {
          unlockSite();
          showRegisteredProfile(ign, platform);
          if (!isFirebaseConfigured) {
            updateLocalFeed();
          }
        }, 1200);

      } catch (err) {
        console.error("Error al registrar:", err);
        gateStatusError.innerHTML = `<span class="icon">✗</span> Error: ${err.message || 'Error de conexión'}`;
        gateStatusError.style.display = 'flex';
      } finally {
        setGateLoading(false);
      }
    });
  }

  // Helper validation for gate form
  function validateGateForm() {
    let isValid = true;
    gateForm.querySelectorAll('.form-group').forEach(group => group.classList.remove('has-error'));

    const ign = document.getElementById('gate-ign-input');
    const platform = document.getElementById('gate-platform-input');
    const password = document.getElementById('gate-password-input');

    if (!ign.value.trim()) {
      ign.closest('.form-group').classList.add('has-error');
      isValid = false;
    }
    if (!platform.value) {
      platform.closest('.form-group').classList.add('has-error');
      isValid = false;
    }
    
    // Verify access password
    if (password.value.trim() !== GATE_PASSWORD) {
      password.closest('.form-group').classList.add('has-error');
      isValid = false;
    }
    
    return isValid;
  }

  function setGateLoading(loading) {
    if (loading) {
      gateBtnSubmit.disabled = true;
      gateSpinner.style.display = 'inline-block';
      gateBtnSubmit.querySelector('.btn-text').textContent = 'Validando...';
    } else {
      gateBtnSubmit.disabled = false;
      gateSpinner.style.display = 'none';
      gateBtnSubmit.querySelector('.btn-text').textContent = 'Ingresar al Multiverso';
    }
  }

  // --- SHOW REGISTERED PROFILE ON PAGE ---
  function showRegisteredProfile(ign, platform) {
    if (registrationCard) {
      registrationCard.innerHTML = `
        <h3 style="font-family:'Cinzel',serif;font-size:1.1rem;margin-bottom:1rem;color:var(--white);letter-spacing:0.05em;">Ficha Activa</h3>
        <div style="background:rgba(138, 80, 255, 0.04);border:1px solid var(--border);border-radius:var(--radius);padding:1.2rem;margin-bottom:1.5rem;">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
            <span class="status-dot pulsing" style="width:8px;height:8px;background-color:#4eca7f;"></span>
            <span style="font-size:0.9rem;font-weight:600;color:var(--white);">Ingreso Confirmado</span>
          </div>
          <p style="font-size:0.95rem;color:var(--white);margin-bottom:0.3rem;">Nick: <strong>${ign}</strong></p>
          <p style="font-size:0.85rem;color:var(--muted);">Plataforma: ${platform}</p>
        </div>
        <button id="btn-change-profile" class="btn-secondary" style="width:100%;justify-content:center;font-size:0.85rem;">
          Cambiar Cuenta / Salir
        </button>
      `;

      document.getElementById('btn-change-profile').addEventListener('click', () => {
        localStorage.removeItem('jind4x_ign');
        localStorage.removeItem('jind4x_platform');
        
        // Reset forms
        if (gateForm) gateForm.reset();
        
        // Re-lock
        lockSite();
        
        // Re-render original template structure on button click
        location.reload();
      });
    }
  }

  // --- IP COPY TO CLIPBOARD ---
  const ipBadges = document.querySelectorAll('.hero-ip, .ip-container');
  ipBadges.forEach(badge => {
    badge.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(SERVER_IP);
        
        // Show indicator on badge
        const originalBg = badge.style.background;
        const originalBorder = badge.style.borderColor;
        badge.style.background = 'rgba(78, 202, 127, 0.1)';
        badge.style.borderColor = '#4eca7f';
        
        const valueSpan = badge.querySelector('.hero-ip-value, .ip-address');
        const originalText = valueSpan.textContent;
        valueSpan.textContent = '¡IP Copiada!';
        
        setTimeout(() => {
          badge.style.background = originalBg;
          badge.style.borderColor = originalBorder;
          valueSpan.textContent = originalText;
        }, 1800);
      } catch (err) {
        console.error('Error al copiar:', err);
      }
    });
  });

  // --- REAL-TIME FEED OF LAST REGISTRATIONS ---
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "registros"), orderBy("timestamp", "desc"), limit(6));
      onSnapshot(q, (snapshot) => {
        feedContainer.innerHTML = '';
        if (snapshot.empty) {
          feedContainer.innerHTML = '<div class="feed-placeholder">Nadie se ha registrado aún. ¡Sé el primero!</div>';
          return;
        }
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const item = createFeedItem(data.ign, data.plataforma);
          feedContainer.appendChild(item);
        });
      }, (error) => {
        console.error("Error en feed de Firestore:", error);
        feedContainer.innerHTML = '<div class="feed-placeholder">Error al cargar feed (¿Base de datos creada?).</div>';
      });
    } catch (e) {
      console.error("Error al suscribirse al feed:", e);
      feedContainer.innerHTML = '<div class="feed-placeholder">Error al iniciar feed.</div>';
    }
  } else {
    updateLocalFeed();
  }

  // Helper to create list items
  function createFeedItem(ign, platform) {
    const div = document.createElement('div');
    div.className = 'feed-item';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'feed-name';
    nameSpan.textContent = ign;
    
    const platSpan = document.createElement('span');
    platSpan.className = 'feed-platform';
    platSpan.textContent = platform === 'Java Edition' ? 'Java' : 'Bedrock';
    
    div.appendChild(nameSpan);
    div.appendChild(platSpan);
    return div;
  }

  function updateLocalFeed() {
    if (!feedContainer) return;
    feedContainer.innerHTML = '';
    const records = JSON.parse(localStorage.getItem('jind4x_logs') || '[]');
    if (records.length === 0) {
      const mocks = [
        { ign: 'jinD4x', plataforma: 'Java Edition' },
        { ign: 'SteveSMP', plataforma: 'Bedrock Edition' },
        { ign: 'AlexGamer', plataforma: 'Java Edition' }
      ];
      mocks.forEach(m => feedContainer.appendChild(createFeedItem(m.ign, m.plataforma)));
      return;
    }
    
    records.slice().reverse().slice(0, 6).forEach(m => {
      feedContainer.appendChild(createFeedItem(m.ign, m.plataforma));
    });
  }
});
