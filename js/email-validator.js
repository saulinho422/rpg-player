// =====================================
// VALIDAÇÃO DE EMAIL DUPLICADO - FIREBASE
// =====================================

import { auth } from './firebase-config.js'
import { fetchSignInMethodsForEmail } from 'firebase/auth'

// Função para verificar se email já existe
async function checkEmailExists(email) {
    try {
        console.log('🔍 Verificando se email existe:', email)

        // Usa Firebase Auth para verificar se o email já está registrado
        const methods = await fetchSignInMethodsForEmail(auth, email)

        if (methods && methods.length > 0) {
            console.log('⚠️ Email já existe no sistema')
            return true
        }

        console.log('✅ Email disponível para registro')
        return false

    } catch (error) {
        console.error('Erro ao verificar email:', error)
        return false // Em caso de erro, permite o registro
    }
}

// Adiciona a função globalmente
window.checkEmailExists = checkEmailExists