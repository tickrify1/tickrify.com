// Script de emergência para expandir a sidebar
// Execute no console do navegador (F12) se a sidebar estiver colapsada

function expandirSidebar() {
    console.log('🔧 Tentando expandir sidebar...');
    
    // Método 1: Pressionar Ctrl+B programaticamente
    const event = new KeyboardEvent('keydown', {
        key: 'b',
        ctrlKey: true,
        bubbles: true
    });
    window.dispatchEvent(event);
    
    // Método 2: Clicar no botão de expansão se existir
    const expandButton = document.querySelector('[title*="Expandir"]');
    if (expandButton) {
        expandButton.click();
        console.log('✅ Botão de expansão clicado');
    }
    
    // Método 3: Clicar no logo da Tickrify
    const logo = document.querySelector('[title*="Clique para expandir"]');
    if (logo) {
        logo.click();
        console.log('✅ Logo clicado para expandir');
    }
    
    setTimeout(() => {
        console.log('🎯 Sidebar deve estar expandida agora');
    }, 500);
}

// Disponibilizar função globalmente
window.expandirSidebar = expandirSidebar;

console.log('🚀 Script carregado!');
console.log('📋 Para expandir sidebar, execute: expandirSidebar()');
console.log('⌨️  Ou pressione: Ctrl+B');
console.log('🖱️  Ou clique no logo azul da Tickrify na sidebar');

// Auto-executar se detectar sidebar colapsada
const sidebarWidth = document.querySelector('[class*="w-16"]');
if (sidebarWidth) {
    console.log('⚠️ Sidebar colapsada detectada - expandindo automaticamente...');
    setTimeout(expandirSidebar, 1000);
}
