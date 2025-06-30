// Configuração da API
const API_URL = 'https://styleback.onrender.com/api';

async function register() {
  try {
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    
    // Validação básica
    if (!name || !email || !password) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    const user = {
      name,
      email,
      password
    };

    // Enviar dados para o backend
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(user)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao cadastrar usuário');
    }

    const data = await response.json();
    
    // Armazenar token e dados do usuário
    localStorage.setItem('token', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    
    // Redirecionar para a página de formulário
    window.location.href = 'formulario.html';
  } catch (error) {
    console.error('Erro no cadastro:', error);
    alert(`Erro no cadastro: ${error.message}`);
  }
}

async function login() {
  try {
    const email = document.querySelector('#e-mail').value;
    const password = document.querySelector('#senha').value;

    // Validação básica
    if (!email || !password) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const user = {
      email,
      password
    };

    // Enviar dados para o backend
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(user)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao fazer login');
    }

    const data = await response.json();
    
    // Armazenar token e dados do usuário
    localStorage.setItem('token', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    
    // Verificar se o usuário já tem preferências
    const token = data.token;
    const preferencesResponse = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    const userData = await preferencesResponse.json();
    
    // Redirecionar para a página de formulário se não tiver preferências, ou para o perfil se já tiver
    if (!userData.preferences || Object.keys(userData.preferences).length === 0) {
      window.location.href = 'formulario.html';
    } else {
      window.location.href = 'perfil.html';
    }
  } catch (error) {
    console.error('Erro no login:', error);
    alert(`Erro no login: ${error.message}`);
  }
}

// Função para verificar se o usuário está autenticado
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
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

// Função para carregar dados do usuário atual
async function loadCurrentUser() {
  if (!checkAuth()) return;
  
  try {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    const userH1 = document.querySelector('h1');
    if (userH1) {
      userH1.innerHTML = `Bem vindo, ${userData.name || 'Usuário'}`;
    }
    
    return userData;
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    return null;
  }
}

// Função para obter lista de usuários (apenas para administradores)
async function getUsers() {
  if (!checkAuth()) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar lista de usuários');
    }

    const users = await response.json();
    
    const usersTable = document.querySelector('#users');
    if (usersTable) {
      usersTable.innerHTML = '';
      users.forEach(user => {
        usersTable.innerHTML += `<tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
          </tr>`;
      });
    }
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    alert('Erro ao carregar lista de usuários: ' + error.message);
  }
}

// Carregar dados quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos na página de administração de usuários
  const usersTable = document.querySelector('#users');
  if (usersTable) {
    getUsers();
  }
  
  // Carregar dados do usuário atual
  loadCurrentUser();
  
  // Adicionar evento de logout
  const logoutButton = document.querySelector('.logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }
});