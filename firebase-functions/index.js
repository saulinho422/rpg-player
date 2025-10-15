const { beforeUserCreated, beforeUserSignedIn } = require('firebase-functions/v2/identity')

// 🔥 FUNÇÃO ESSENCIAL: Adiciona role 'authenticated' para novos usuários
exports.beforecreated = beforeUserCreated((event) => {
  console.log('🆕 Novo usuário criado:', event.data.email)
  
  return {
    customClaims: {
      // ⭐ CRUCIAL: Supabase precisa desta claim para funcionar
      role: 'authenticated',
      
      // Opcional: adicionar outras claims
      created_at: new Date().toISOString(),
      provider: event.data.providerData?.[0]?.providerId || 'email'
    },
  }
})

// 🔥 FUNÇÃO ESSENCIAL: Garante role 'authenticated' em todos os logins
exports.beforesignedin = beforeUserSignedIn((event) => {
  console.log('🔑 Usuário fazendo login:', event.data.email)
  
  return {
    customClaims: {
      // ⭐ CRUCIAL: Supabase precisa desta claim para funcionar
      role: 'authenticated',
      
      // Opcional: atualizar último login
      last_sign_in: new Date().toISOString(),
      provider: event.data.providerData?.[0]?.providerId || 'email'
    },
  }
})

// 📝 OPCIONAL: Função para sincronizar perfil com Supabase
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

// Inicializar Firebase Admin (apenas uma vez)
if (admin.apps.length === 0) {
  admin.initializeApp()
}

exports.syncUserProfile = onCall(async (request) => {
  // Verificar se o usuário está autenticado
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Usuário deve estar logado')
  }

  const uid = request.auth.uid
  const userData = request.data

  try {
    // Atualizar custom claims se necessário
    await admin.auth().setCustomUserClaims(uid, {
      role: 'authenticated',
      updated_at: new Date().toISOString(),
      ...userData.customClaims
    })

    return { 
      success: true, 
      message: 'Perfil sincronizado com Supabase',
      uid: uid 
    }
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar perfil:', error)
    throw new HttpsError('internal', 'Erro ao sincronizar perfil')
  }
})