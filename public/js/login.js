// Possui os métodos para requisitar rotas de login e cadastro do backend

async function fazerLogin(email, senha) {
    try {
        const response = await fetch(`${urlBase}/logins`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.remove();
        }

        if (response.ok) {

            const data = await response.json();
            localStorage.setItem('token', data.access_token)
            window.location.href = 'cadastrar.html';

        } else {
            throw new Error('Credenciais Inválidas');
        }
    } catch (error) {
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
            window.showErrorMessage(`${error}`)
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

        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.remove();
        }

        if (response.ok) {
            window.location.href = 'index.html';
        } else {
            const responseData = await response.json();
            const errorMessages = responseData.errors.map(error => error.msg).join(', ');
            throw new Error(errorMessages);
        }
    } catch (error) {
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
            window.showErrorMessage(`${error}`)
        }
    });
}