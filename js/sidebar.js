/**
 * Gerenciamento da Sidebar Global
 * Script responsável pelo comportamento da sidebar em todas as páginas
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos da sidebar
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebarClose = document.querySelector('.sidebar-close');
    const mainContent = document.querySelector('.main-content');
    
    // Verificar se os elementos existem
    if (!sidebar) return;
    
    // Função para abrir a sidebar
    function openSidebar() {
        sidebar.classList.add('active');
        document.body.style.overflow = 'hidden'; // Previne rolagem quando sidebar está aberta em mobile
    }
    
    // Função para fechar a sidebar
    function closeSidebar() {
        sidebar.classList.remove('active');
        document.body.style.overflow = ''; // Restaura rolagem
    }
    
    // Função para alternar a sidebar
    function toggleSidebar() {
        if (sidebar.classList.contains('active')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
    
    // Event listeners
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Previne propagação do evento
            toggleSidebar();
        });
    }
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', function(e) {
            e.stopPropagation(); // Previne propagação do evento
            closeSidebar();
        });
    }
    
    // Fechar sidebar ao clicar fora em dispositivos móveis
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggle = sidebarToggle && sidebarToggle.contains(event.target);
        
        // Se o clique não foi dentro da sidebar nem no botão de toggle
        // e a sidebar está aberta (tem a classe 'active')
        if (!isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
    
    // Adicionar evento de escape para fechar a sidebar
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
    
    // Marcar o item de menu ativo com base na URL atual
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href) {
            const itemPath = href.split('/').pop(); // Pega apenas o nome do arquivo
            const currentFile = currentPath.split('/').pop() || 'index.html'; // Pega apenas o nome do arquivo atual
            
            if (itemPath === currentFile) {
                item.classList.add('active');
            }
        }
    });
    
    // Carregar informações do usuário na sidebar se estiver logado
    const userAvatar = document.querySelector('.user-avatar img');
    const userName = document.querySelector('.user-name');
    
    if (userAvatar && userName) {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            
            if (userData) {
                userName.textContent = userData.name || 'Usuário';
                
                if (userData.profileImage) {
                    userAvatar.src = userData.profileImage;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }
    
    // Configurar evento de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.location.href = 'entrar.html';
        });
    }
});