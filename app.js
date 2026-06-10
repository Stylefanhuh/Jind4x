import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- CONFIGURACIÓN DE FIREBASE ---
// Reemplaza esto con tus credenciales de Firebase Console para guardar los registros
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
  
  // IP Badges and copy controls
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

  // Form elements
  const form = document.getElementById('smp-registration-form');
  const btnSubmit = document.getElementById('btn-submit-registration');
  const spinner = document.getElementById('reg-spinner');
  const statusSuccess = document.getElementById('reg-status-success');
  const statusError = document.getElementById('reg-status-error');
  const feedContainer = document.getElementById('players-list-feed');

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
        feedContainer.innerHTML = '<div class="feed-placeholder">Error al cargar feed en tiempo real.</div>';
      });
    } catch (e) {
      console.error(e);
    }
  } else {
    // Local storage simulation
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
    feedContainer.innerHTML = '';
    const records = JSON.parse(localStorage.getItem('jind4x_logs') || '[]');
    if (records.length === 0) {
      // Mock list if completely empty to make it look active
      const mocks = [
        { ign: 'jinD4x', plataforma: 'Java Edition' },
        { ign: 'SteveSMP', plataforma: 'Bedrock Edition' },
        { ign: 'AlexGamer', plataforma: 'Java Edition' }
      ];
      mocks.forEach(m => feedContainer.appendChild(createFeedItem(m.ign, m.plataforma)));
      return;
    }
    
    // Sort and take latest 6
    records.slice().reverse().slice(0, 6).forEach(m => {
      feedContainer.appendChild(createFeedItem(m.ign, m.plataforma));
    });
  }

  // --- SUBMISSION LOGIC ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusSuccess.style.display = 'none';
    statusError.style.display = 'none';
    
    if (!validateForm()) return;
    
    setLoading(true);
    const ign = document.getElementById('ign-input').value.trim();
    const platform = document.getElementById('platform-input').value;
    const discord = document.getElementById('discord-input').value.trim();

    const registrationData = {
      ign: ign,
      plataforma: platform,
      discord: discord || 'No provisto',
      timestamp: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
    };

    try {
      if (isFirebaseConfigured && db) {
        await addDoc(collection(db, "registros"), registrationData);
        statusSuccess.style.display = 'flex';
      } else {
        // Simulation write
        await new Promise(r => setTimeout(r, 1000));
        const records = JSON.parse(localStorage.getItem('jind4x_logs') || '[]');
        records.push({ ign, plataforma: platform });
        localStorage.setItem('jind4x_logs', JSON.stringify(records));
        
        statusSuccess.innerHTML = '<span class="icon">✓</span> ¡Ingreso registrado (Simulación)! Configura Firebase en app.js para guardar real.';
        statusSuccess.style.display = 'flex';
        updateLocalFeed();
      }
      form.reset();
    } catch (err) {
      console.error(err);
      statusError.style.display = 'flex';
    } finally {
      setLoading(false);
    }
  });

  function validateForm() {
    let isValid = true;
    form.querySelectorAll('.form-group').forEach(group => group.classList.remove('has-error'));

    const ign = document.getElementById('ign-input');
    const platform = document.getElementById('platform-input');

    if (!ign.value.trim()) {
      ign.closest('.form-group').classList.add('has-error');
      isValid = false;
    }
    if (!platform.value) {
      platform.closest('.form-group').classList.add('has-error');
      isValid = false;
    }
    return isValid;
  }

  function setLoading(loading) {
    if (loading) {
      btnSubmit.disabled = true;
      spinner.style.display = 'inline-block';
      btnSubmit.querySelector('.btn-text').textContent = 'Registrando...';
    } else {
      btnSubmit.disabled = false;
      spinner.style.display = 'none';
      btnSubmit.querySelector('.btn-text').textContent = 'Confirmar Registro';
    }
  }
});
