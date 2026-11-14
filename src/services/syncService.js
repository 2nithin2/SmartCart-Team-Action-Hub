import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update } from "firebase/database";
import { initialDmartItems, initialGroupTasks, initialTeamMembers } from "../data/seedItems";

const LOCAL_STORAGE_KEY_ITEMS = "dmart_items_v2";
const LOCAL_STORAGE_KEY_TASKS = "dmart_tasks_v2";
const LOCAL_STORAGE_KEY_MEMBERS = "dmart_members_v2";
const LOCAL_STORAGE_KEY_CONFIG = "dmart_firebase_config_v2";

// Broadcast channel for multi-tab local sync
let broadcastChannel = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    broadcastChannel = new BroadcastChannel("dmart_sync_channel");
  }
} catch (e) {
  console.warn("BroadcastChannel not supported", e);
}

// Get stored or env firebase config
export function getStoredFirebaseConfig() {
  if (typeof window === "undefined") return null;

  // Check LocalStorage first (user configured in UI)
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.databaseURL && parsed.apiKey) {
        return parsed;
      }
    } catch (e) {
      console.warn("Invalid stored firebase config", e);
    }
  }

  // Check Vite environment variables
  const envUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;
  const envKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProject = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (envUrl && envKey) {
    return {
      apiKey: envKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProject}.firebaseapp.com`,
      databaseURL: envUrl,
      projectId: envProject || "",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
    };
  }

  return null;
}

export function saveStoredFirebaseConfig(config) {
  if (typeof window === "undefined") return;
  if (!config) {
    localStorage.removeItem(LOCAL_STORAGE_KEY_CONFIG);
  } else {
    localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(config));
  }
}

let firebaseApp = null;
let realtimeDb = null;

export function initFirebase() {
  const config = getStoredFirebaseConfig();
  if (!config || !config.databaseURL) {
    firebaseApp = null;
    realtimeDb = null;
    return null;
  }

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    realtimeDb = getDatabase(firebaseApp);
    return realtimeDb;
  } catch (err) {
    console.error("Firebase init failed:", err);
    firebaseApp = null;
    realtimeDb = null;
    return null;
  }
}

// Subscribe to real-time sync
export function subscribeToSync({
  onItemsChange,
  onTasksChange,
  onMembersChange,
  onConnectionStatus
}) {
  const db = initFirebase();

  if (db) {
    onConnectionStatus({
      connected: true,
      mode: "cloud",
      message: "🟢 Connected to Cloud Realtime Database (Multi-User Synced)"
    });

    const itemsRef = ref(db, "dmart_shared/items");
    const tasksRef = ref(db, "dmart_shared/tasks");
    const membersRef = ref(db, "dmart_shared/members");

    const unsubItems = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data)) {
        localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(data));
        onItemsChange(data);
      } else if (!data) {
        // First time cloud initialization with default items
        const local = getLocalItems();
        set(itemsRef, local);
        onItemsChange(local);
      }
    }, (error) => {
      console.error("Firebase items error:", error);
      onConnectionStatus({
        connected: false,
        mode: "local",
        message: `⚠️ Cloud Sync Error: ${error.message}. Using Local Storage.`
      });
      onItemsChange(getLocalItems());
    });

    const unsubTasks = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data)) {
        localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(data));
        onTasksChange(data);
      } else if (!data) {
        const local = getLocalTasks();
        set(tasksRef, local);
        onTasksChange(local);
      }
    });

    const unsubMembers = onValue(membersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data)) {
        localStorage.setItem(LOCAL_STORAGE_KEY_MEMBERS, JSON.stringify(data));
        onMembersChange(data);
      } else if (!data) {
        const local = getLocalMembers();
        set(membersRef, local);
        onMembersChange(local);
      }
    });

    return () => {
      unsubItems();
      unsubTasks();
      unsubMembers();
    };
  } else {
    // Local mode with BroadcastChannel
    onConnectionStatus({
      connected: false,
      mode: "local",
      message: "🟡 Local Storage Mode (Click 'Connect Cloud Sync' to sync with other users)"
    });

    onItemsChange(getLocalItems());
    onTasksChange(getLocalTasks());
    onMembersChange(getLocalMembers());

    if (broadcastChannel) {
      const handleBroadcast = (event) => {
        const { type, data } = event.data || {};
        if (type === "ITEMS_UPDATED") onItemsChange(data);
        if (type === "TASKS_UPDATED") onTasksChange(data);
        if (type === "MEMBERS_UPDATED") onMembersChange(data);
      };
      broadcastChannel.addEventListener("message", handleBroadcast);
      return () => {
        broadcastChannel.removeEventListener("message", handleBroadcast);
      };
    }

    return () => {};
  }
}

// Local getters
export function getLocalItems() {
  if (typeof window === "undefined") return initialDmartItems;
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ITEMS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse local items", e);
    }
  }
  return initialDmartItems;
}

export function getLocalTasks() {
  if (typeof window === "undefined") return initialGroupTasks;
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse local tasks", e);
    }
  }
  return initialGroupTasks;
}

export function getLocalMembers() {
  if (typeof window === "undefined") return initialTeamMembers;
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_MEMBERS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse local members", e);
    }
  }
  return initialTeamMembers;
}

// Save functions that sync to both Firebase (if connected) and LocalStorage
export async function syncSaveItems(items) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(items));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: "ITEMS_UPDATED", data: items });
    }
  }

  if (realtimeDb) {
    try {
      const itemsRef = ref(realtimeDb, "dmart_shared/items");
      await set(itemsRef, items);
    } catch (err) {
      console.error("Failed to push items to Firebase:", err);
    }
  }
}

export async function syncSaveTasks(tasks) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: "TASKS_UPDATED", data: tasks });
    }
  }

  if (realtimeDb) {
    try {
      const tasksRef = ref(realtimeDb, "dmart_shared/tasks");
      await set(tasksRef, tasks);
    } catch (err) {
      console.error("Failed to push tasks to Firebase:", err);
    }
  }
}

export async function syncSaveMembers(members) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY_MEMBERS, JSON.stringify(members));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: "MEMBERS_UPDATED", data: members });
    }
  }

  if (realtimeDb) {
    try {
      const membersRef = ref(realtimeDb, "dmart_shared/members");
      await set(membersRef, members);
    } catch (err) {
      console.error("Failed to push members to Firebase:", err);
    }
  }
}

// Export / Import
export function exportAllData() {
  const data = {
    exportDate: new Date().toISOString(),
    version: "2.0",
    items: getLocalItems(),
    tasks: getLocalTasks(),
    teamMembers: getLocalMembers()
  };
  return JSON.stringify(data, null, 2);
}

export async function importAllData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.items && Array.isArray(data.items)) {
      await syncSaveItems(data.items);
    }
    if (data.tasks && Array.isArray(data.tasks)) {
      await syncSaveTasks(data.tasks);
    }
    if (data.teamMembers && Array.isArray(data.teamMembers)) {
      await syncSaveMembers(data.teamMembers);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function resetAllToDefaults() {
  await syncSaveItems(initialDmartItems);
  await syncSaveTasks(initialGroupTasks);
  await syncSaveMembers(initialTeamMembers);
}
