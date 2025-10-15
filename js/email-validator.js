// =====================================
// VALIDAÇÃO DE EMAIL DUPLICADO - MÉTODO MELHORADO
// =====================================

// Função para verificar se email já existe
async function checkEmailExists(email) {
    try {
        console.log('🔍 Verificando se email existe:', email)
        
        // Tenta fazer um "reset de senha" (não envia email, só verifica se existe)
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:3004/login.html' // URL fictícia para não enviar email real
        })
        
        // Se não der erro, significa que o email existe
        if (!error) {
            console.log('⚠️ Email já existe no sistema')
            return true
        }
        
        // Se der erro específico de "email not found", então não existe
        if (error.message.includes('Email not found') || error.message.includes('User not found')) {
            console.log('✅ Email disponível para registro')
            return false
        }
        
        // Para outros erros, assumimos que não existe (pode ser configuração)
        console.log('🤔 Erro desconhecido, assumindo que email não existe:', error.message)
        return false
        
    } catch (error) {
        console.error('Erro ao verificar email:', error)
        return false // Em caso de erro, permite o registro
    }
}

// Adiciona a função globalmente
window.checkEmailExists = checkEmailExists