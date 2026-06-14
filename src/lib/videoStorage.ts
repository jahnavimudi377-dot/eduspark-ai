// IndexedDB-backed storage for generated videos.
// Persists video Blob + thumbnail across reloads.

export type StoredProject = {
  id: string;
  title: string;
  prompt: string;
  topic: string;
  format: string;
  duration: number;
  voice: string;
  createdAt: number;
  mimeType: string;
  size: number;
  video: Blob;
  thumbnail: Blob;
  script: string[];
};

export type ProjectMeta = Omit<StoredProject, "video" | "thumbnail"> & {
  videoUrl: string;
  thumbnailUrl: string;
};

const DB_NAME = "eduverse_ai";
const DB_VERSION = 1;
const STORE = "projects";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveProject(p: StoredProject): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(p);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function listProjects(): Promise<ProjectMeta[]> {
  const db = await openDB();
  const items = await new Promise<StoredProject[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as StoredProject[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return items
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((p) => ({
      ...p,
      videoUrl: URL.createObjectURL(p.video),
      thumbnailUrl: URL.createObjectURL(p.thumbnail),
    }));
}

export async function getProject(id: string): Promise<ProjectMeta | null> {
  const db = await openDB();
  const item = await new Promise<StoredProject | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as StoredProject | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  if (!item) return null;
  return {
    ...item,
    videoUrl: URL.createObjectURL(item.video),
    thumbnailUrl: URL.createObjectURL(item.thumbnail),
  };
}

export async function deleteProject(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
