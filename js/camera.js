
// Configuração da API
const API_URL = 'http://localhost:3000/api';

function toggleSidebar() {
    let sidebar = document.getElementById("sidebar");
    sidebar.style.left = (sidebar.style.left === "0px") ? "-250px" : "0px";
}

// Verificar se o usuário está autenticado
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Redirecionar para a página de login se não estiver autenticado
        window.location.href = 'entrar.html';
        return false;
    }
    return true;
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = 'entrar.html';
}

// Função para carregar os dados do usuário do backend
async function loadUserData() {
    if (!checkAuth()) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar dados do usuário');
        }

        const userData = await response.json();
        
        // Atualizar elementos da interface com dados do usuário
        const usernameElement = document.querySelector('.username');
        if (usernameElement) {
            usernameElement.textContent = userData.name || 'Usuário';
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
    }
}

// Função para visualizar uma combinação
async function verLook(id) {
    if (!checkAuth()) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/combinations/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar detalhes da combinação');
        }

        const combination = await response.json();
        console.log('Detalhes da combinação:', combination);
        
        // Implementação futura para mostrar detalhes da combinação
        alert(`Visualizando combinação: ${combination.name || 'Sem nome'}`);
        
    } catch (error) {
        console.error('Erro ao visualizar combinação:', error);
        alert('Erro ao carregar detalhes da combinação');
    }
}

// Carregar dados quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    
    // Adicionar evento de logout
    const logoutButton = document.querySelector('.logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});

// Função para mostrar mensagens de erro
function showError(message) {
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
        successMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
        successMessage.style.background = '#d63031';
        successMessage.classList.add('show');
        
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 3000);
    } else {
        alert(message);
    }
}

// Função para mostrar mensagens de sucesso
function showSuccess(message) {
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
        successMessage.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
        successMessage.style.background = 'var(--success)';
        successMessage.classList.add('show');
        
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 3000);
    } else {
        alert(message);
    }
}