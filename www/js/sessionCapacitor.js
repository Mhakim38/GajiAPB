// sessionCapacitor.js
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

export async function setupCapacitorSessionChecker() {
  try {
    const { App } = await import('@capacitor/app');
    const auth = getAuth();

    let backgroundTimestamp = null;
    const sessionDuration = 10 * 1000; // 10 sec Testing
    // const sessionDuration = 30 * 60 * 1000; // 30 minutes

    App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        backgroundTimestamp = Date.now();
      } else {
        const idleTime = Date.now() - backgroundTimestamp;
        if (idleTime > sessionDuration) {
          signOut(auth).then(() => {
            location.href = 'login.html';
          });
        } else {
          localStorage.setItem('loginTime', Date.now().toString());
        }
      }
    });
  } catch (err) {
    console.warn("Capacitor plugin not available in web mode. Skipping background session tracking.");
  }
}
