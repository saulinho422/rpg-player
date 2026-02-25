import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const app = initializeApp({
    apiKey: "AIzaSyDdJLB9LOgzSLjq8XL4h9b8C8S0Lj-0fQE",
    authDomain: "player-7a871.firebaseapp.com",
    projectId: "player-7a871",
    storageBucket: "player-7a871.firebasestorage.app",
    messagingSenderId: "654737462105",
    appId: "1:654737462105:web:e33d19e0f54e2c2f8a5d86"
});

const db = getFirestore(app);
const uid = 'tTiCaI3NqaZwB8WMzY9qvFbuWRD2';

try {
    await updateDoc(doc(db, 'users', uid), {
        is_admin: true,
        is_owner: true
    });
    console.log('✅ Usuário atualizado como ADMIN e OWNER!');
    process.exit(0);
} catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
}
