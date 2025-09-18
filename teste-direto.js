// Teste direto do incremento do contador
// Para usar: copie e cole no console do navegador (F12) quando estiver em localhost:5173

async function testarContador() {
    console.log('🧪 INICIANDO TESTE DO CONTADOR');
    
    // 1. Verificar estado inicial
    const inicial = localStorage.getItem('tickrify-monthly-usage');
    console.log('📊 Estado inicial:', inicial);
    
    // 2. Se não existe, criar
    if (!inicial) {
        const novoEstado = {
            count: 0,
            month: new Date().getMonth().toString(),
            year: new Date().getFullYear()
        };
        localStorage.setItem('tickrify-monthly-usage', JSON.stringify(novoEstado));
        console.log('✅ Estado inicial criado:', novoEstado);
    }
    
    // 3. Simular análise via API
    try {
        console.log('🚀 Fazendo análise via API...');
        const response = await fetch('http://localhost:8000/api/analyze-chart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                user_id: 'test_counter_' + Date.now()
            })
        });
        
        const result = await response.json();
        console.log('✅ Resposta da API:', result);
        
        // 4. Verificar se contador foi incrementado (isso deveria acontecer automaticamente via React)
        setTimeout(() => {
            const final = localStorage.getItem('tickrify-monthly-usage');
            console.log('📈 Estado final:', final);
            
            const estadoFinal = JSON.parse(final);
            console.log('🎯 Contador atual:', estadoFinal.count);
            
            // 5. Atualizar página dashboard para ver mudança visual
            console.log('💡 Para ver a mudança, acesse /dashboard ou recarregue a página');
        }, 1000);
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Disponibilizar função
window.testarContador = testarContador;
console.log('Execute: testarContador()');
