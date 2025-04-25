// sessionCapacitor.js
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

export function setupCapacitorSessionChecker() {
  // Grab the App plugin from the global Capacitor object
  const App = window.Capacitor?.Plugins?.App;
  if (!App || typeof App.addListener !== 'function') {
    console.warn("Capacitor App plugin not available. Skipping background session tracking.");
    return;
  }

  const auth = getAuth();
  let backgroundTimestamp = null;
  const sessionDuration = 30 * 60 * 1000; // 10 sec for testing (use 30*60*1000 for 30m)

  App.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) {
      backgroundTimestamp = Date.now();
    } else if (backgroundTimestamp) {
      const idleTime = Date.now() - backgroundTimestamp;
      console.log('[SessionChecker] Resumed, idleTime:', idleTime);

      if (idleTime > sessionDuration) {
        signOut(auth).then(() => {
          location.href = 'login.html';
        });
      } else {
        localStorage.setItem('loginTime', Date.now().toString());
        console.log('[SessionChecker] Session still valid, refreshed loginTime');
      }

      backgroundTimestamp = null;
    }
  });
}
