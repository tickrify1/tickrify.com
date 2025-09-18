// Teste do contador de uso mensal
// Execute este código no console do navegador (F12)

console.log('🧪 TESTE DO CONTADOR DE USO MENSAL');

// 1. Verificar estado atual do localStorage
const currentUsage = localStorage.getItem('tickrify-monthly-usage');
console.log('📊 Uso mensal atual no localStorage:', currentUsage);

// 2. Se não existe, criar um inicial
if (!currentUsage) {
  const initialUsage = {
    count: 0,
    month: new Date().getMonth().toString(),
    year: new Date().getFullYear()
  };
  localStorage.setItem('tickrify-monthly-usage', JSON.stringify(initialUsage));
  console.log('✅ Uso mensal inicial criado:', initialUsage);
}

// 3. Simular incremento manual
function incrementarContador() {
  const usage = JSON.parse(localStorage.getItem('tickrify-monthly-usage') || '{}');
  usage.count = (usage.count || 0) + 1;
  localStorage.setItem('tickrify-monthly-usage', JSON.stringify(usage));
  console.log('📈 Contador incrementado para:', usage.count);
  return usage;
}

// 4. Função para testar
console.log('Execute: incrementarContador() para testar manualmente');
console.log('Depois acesse /dashboard para ver se reflete na UI');

// Disponibilizar função globalmente
window.incrementarContador = incrementarContador;
