const urlBase = 'http://localhost:4000/api'

async function fazerLogin(email, senha) {
    try {
        const response = await fetch(`${urlBase}/logins`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });
        if (response.ok) {

            const data = await response.json();
            localStorage.setItem('token', data.access_token)
            window.location.href = 'cadastrar.html';

        } else if (response.status === 403) {
            alert('Credenciais inválidas');
        } else {
            console.error('Erro ao fazer login:', response.statusText);
            throw new Error('Erro ao fazer login');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        throw error;
    }
}

const formLogin = document.getElementById('formLogin');
if(formLogin){
    formLogin.addEventListener('submit', async function (event){
        event.preventDefault()
        const email = document.getElementById('email').value
        const senha = document.getElementById('password').value

        try {
            await fazerLogin(email, senha);
        } catch (error) {
            console.error('Erro ao fazer login:', error);
        }
    })
}

async function cadastrarUsuario(nome, email, senha) {
    try {
        const response = await fetch(`${urlBase}/logins/cadastro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha })
        });
        if (response.ok) {
            window.location.href = 'index.html';
        } else if (response.status === 409){
            const errorData = await response.json();
            const errorMsg = errorData.errors?.[0]?.msg || 'Erro de conflito desconhecido';
            alert(errorMsg);
        } else {
            console.error('Erro ao fazer cadastro:', response.statusText);
            throw new Error('Erro ao fazer cadastro');
        }
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        throw error;
    }
}

const formCadastro = document.getElementById('formCadastro');
if (formCadastro){
    formCadastro.addEventListener('submit', async function (event) {
        event.preventDefault()
    
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('password').value;
    
        try {
            await cadastrarUsuario(nome, email, senha);
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
        }
    });
}