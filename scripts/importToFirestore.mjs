import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) {
    const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
    process.env[key.trim()] = val;
  }
});

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dbPath = join(__dirname, '..', 'db.json');
const rawData = JSON.parse(readFileSync(dbPath, 'utf-8'));

const importCollection = async (collectionName, items) => {
  console.log(`\n📦 匯入 ${collectionName}（共 ${items.length} 筆）...`);
  for (const item of items) {
    const docId = String(item.id);
    const { id, ...data } = item;
    await setDoc(doc(collection(db, collectionName), docId), data);
    console.log(`  ✅ ${collectionName}/${docId}`);
  }
};

const run = async () => {
  try {
    for (const [collectionName, items] of Object.entries(rawData)) {
      if (Array.isArray(items) && items.length > 0) {
        await importCollection(collectionName, items);
      }
    }
    console.log('\n🎉 全部匯入完成！');
    process.exit(0);
  } catch (err) {
    console.error('❌ 匯入失敗：', err.message);
    process.exit(1);
  }
};

run();
