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

// Função para carregar as combinações do usuário
async function loadCombinations() {
    if (!checkAuth()) return;
    
    const photoFeed = document.getElementById('photo-feed');
    if (!photoFeed) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/combinations`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar combinações');
        }

        const data = await response.json();
        console.log('Combinações carregadas:', data);
        
        // Verificar o formato da resposta e extrair as combinações
        let combinations;
        if (data.combinations) {
            combinations = data.combinations;
        } else if (Array.isArray(data)) {
            combinations = data;
        } else {
            combinations = [];
        }
        
        photoFeed.innerHTML = '';
        
        if (combinations.length === 0) {
            photoFeed.innerHTML = '<div class="no-combinations"><i class="fas fa-tshirt"></i><p>Nenhuma combinação encontrada.</p><p>Crie suas combinações de roupas para visualizá-las aqui!</p></div>';
            return;
        }
        
        combinations.forEach(combination => {
            const feedItem = document.createElement('div');
            feedItem.className = 'feed-item';
            feedItem.setAttribute('data-id', combination.id || combination._id);
            feedItem.addEventListener('click', () => viewCombination(combination.id || combination._id));
            
            // Formatando a data
            const date = new Date(combination.createdAt);
            const formattedDate = date.toLocaleDateString('pt-BR');
            
            // Usar a imagem superior como representação da combinação
            feedItem.innerHTML = `
                <img src="${combination.upperImage}" alt="${combination.name || 'Combinação'}">
                <div class="overlay-text">${combination.name || 'Combinação'}</div>
                <div class="date">${formattedDate}</div>
            `;
            
            photoFeed.appendChild(feedItem);
        });
        
    } catch (error) {
        console.error('Erro ao carregar combinações:', error);
        photoFeed.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i><p>Erro ao carregar combinações. Tente novamente mais tarde.</p></div>';
    }
}

// Função para visualizar uma combinação
async function viewCombination(id) {
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

        const data = await response.json();
        console.log('Detalhes da combinação:', data);
        
        // Verificar o formato da resposta e extrair a combinação
        let combination;
        if (data.combination) {
            combination = data.combination;
        } else {
            combination = data;
        }
        
        // Criar um modal para mostrar os detalhes da combinação
        const modal = document.createElement('div');
        modal.className = 'combination-modal';
        
        // Formatando a data
        const date = new Date(combination.createdAt);
        const formattedDate = date.toLocaleDateString('pt-BR');
        
        // Usar id ou _id dependendo do formato retornado pela API
        const combId = combination.id || combination._id;
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${combination.name || 'Combinação'}</h2>
                <p>Criada em: ${formattedDate}</p>
                <div class="combination-images">
                    <div class="image-container">
                        <h3>Parte Superior</h3>
                        <img src="${combination.upperImage}" alt="Parte Superior">
                    </div>
                    <div class="image-container">
                        <h3>Parte Inferior</h3>
                        <img src="${combination.lowerImage}" alt="Parte Inferior">
                    </div>
                </div>
                <button class="delete-combination" data-id="${combId}">Excluir Combinação</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar evento para fechar o modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Adicionar evento para excluir a combinação
        modal.querySelector('.delete-combination').addEventListener('click', async (event) => {
            const combinationId = event.target.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir esta combinação?')) {
                await deleteCombination(combinationId);
                document.body.removeChild(modal);
                loadCombinations(); // Recarregar a lista após excluir
            }
        });
        
    } catch (error) {
        console.error('Erro ao visualizar combinação:', error);
        alert('Erro ao carregar detalhes da combinação. Tente novamente mais tarde.');
    }
}

// Função para excluir uma combinação
async function deleteCombination(id) {
    if (!checkAuth()) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/combinations/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao excluir combinação');
        }

        const result = await response.json();
        console.log('Resultado da exclusão:', result);
        return result;
    } catch (error) {
        console.error('Erro ao excluir combinação:', error);
        alert('Erro ao excluir combinação. Tente novamente mais tarde.');
    }
}

// Função para carregar os dados do usuário do backend
async function loadUserData() {
    if (!checkAuth()) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar dados do usuário');
        }

        const data = await response.json();
        console.log('Dados recebidos da API:', data);
        
        // Extrair dados do usuário e preferências
        const userData = data.user || data;
        const preferences = data.preferences || userData.preferences || {};
        
        // Atualizar elementos da interface com dados do usuário
        const profileName = document.querySelector('.profile-info h2');
        if (profileName) {
            profileName.textContent = userData.name || 'Usuário';
        }
        
        const profileUsername = document.querySelector('.profile-info p');
        if (profileUsername) {
            profileUsername.textContent = `@${userData.username || 'usuario'}`;
        }
        
        // Atualizar a bio se existir
        const profileBio = document.querySelector('.profile-info .bio');
        if (profileBio) {
            profileBio.textContent = userData.bio || 'Adicione uma bio ao seu perfil';
        }
        
        // Atualizar a imagem de perfil se existir
        const profileImage = document.querySelector('.profile-pic');
        if (profileImage && userData.profileImage) {
            profileImage.src = userData.profileImage;
        }
        
        // Carregar preferências do usuário
        console.log('Enviando preferências para loadUserPreferences:', preferences);
        loadUserPreferences(preferences);
        
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
    }
}

// Função para carregar as preferências do usuário
function loadUserPreferences(preferences) {
    console.log('Carregando preferências:', preferences);
    
    if (!preferences || Object.keys(preferences).length === 0) {
        console.log('Nenhuma preferência encontrada');
        document.getElementById('preferences-list').innerHTML = '<p>Nenhuma preferência definida.</p>';
        return;
    }
    
    // Mapeamento de chaves de preferências para nomes em português e ícones
    const preferenceMapping = {
        'genero': { label: 'Gênero', icon: 'fa-venus-mars' },
        'tipoCorporal': { label: 'Tipo Corporal', icon: 'fa-male' },
        'formatoCorporal': { label: 'Formato Corporal', icon: 'fa-female' },
        'estiloPrincipal': { label: 'Estilo Principal', icon: 'fa-tshirt' },
        'pecaFrequente': { label: 'Peça Frequente', icon: 'fa-shopping-bag' },
        'corPreferida': { label: 'Cor Preferida', icon: 'fa-palette' },
        'estiloEvitar': { label: 'Estilo a Evitar', icon: 'fa-ban' },
        'ocasiaoComum': { label: 'Ocasião Comum', icon: 'fa-calendar-alt' },
        // Manter compatibilidade com chaves antigas
        'gender': { label: 'Gênero', icon: 'fa-venus-mars' },
        'bodyType': { label: 'Tipo Corporal', icon: 'fa-male' },
        'bodyShape': { label: 'Formato Corporal', icon: 'fa-female' },
        'mainStyle': { label: 'Estilo Principal', icon: 'fa-tshirt' }
    };
    
    const preferencesList = document.getElementById('preferences-list');
    preferencesList.innerHTML = '';
    
    // Adicionar cada preferência à lista com ícones
    for (const key in preferences) {
        if (preferences[key] && preferenceMapping[key]) {
            const preferenceItem = document.createElement('div');
            preferenceItem.className = 'preference-item';
            
            const icon = document.createElement('i');
            icon.className = `fas ${preferenceMapping[key].icon}`;
            preferenceItem.appendChild(icon);
            
            const text = document.createElement('span');
            text.textContent = `${preferenceMapping[key].label}: ${preferences[key]}`;
            preferenceItem.appendChild(text);
            
            preferencesList.appendChild(preferenceItem);
        }
    }
    
    // Se não houver preferências válidas após o processamento
    if (preferencesList.children.length === 0) {
        preferencesList.innerHTML = '<p>Nenhuma preferência definida.</p>';
    }
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = 'entrar.html';
}

// Adicionar evento de logout ao botão
const logoutButton = document.querySelector('.logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', logout);
}

// Chamar as funções quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadCombinations();
});

// Adicionar estilos para o modal
const style = document.createElement('style');
style.textContent = `
.combination-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    max-width: 80%;
    max-height: 80%;
    overflow-y: auto;
    position: relative;
}

.close-modal {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    cursor: pointer;
}

.combination-images {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    margin-top: 20px;
}

.image-container {
    text-align: center;
    margin: 10px;
}

.image-container img {
    max-width: 200px;
    max-height: 300px;
    border-radius: 5px;
}

.delete-combination {
    background-color: #ff4d4d;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
}

.delete-combination:hover {
    background-color: #ff3333;
}

.no-combinations {
    text-align: center;
    margin: 20px;
    font-size: 16px;
}

.error {
    color: #ff4d4d;
    text-align: center;
    margin: 20px;
    font-size: 16px;
}
`;

document.head.appendChild(style);

// Inicializar a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (checkAuth()) {
        // Carregar dados do usuário
        loadUserData();
        // Carregar combinações
        loadCombinations();
    }
});