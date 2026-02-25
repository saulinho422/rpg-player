// =====================================
// RPG PLAYER - CONFIGURAÇÃO FIREBASE
// =====================================

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyDBQ7WocaMQ-f3NMEDZjUM0ro4seE0RyFk",
    authDomain: "player-7a871.firebaseapp.com",
    projectId: "player-7a871",
    storageBucket: "player-7a871.firebasestorage.app",
    messagingSenderId: "526885048287",
    appId: "1:526885048287:web:229cd7035138439a60be6a",
    measurementId: "G-T7P89TVQWK"
}

// Inicializa o Firebase
const app = initializeApp(firebaseConfig)

// Serviços
const auth = getAuth(app)
const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()

export { app, auth, db, googleProvider }
