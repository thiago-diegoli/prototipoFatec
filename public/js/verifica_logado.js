const urlBase = window.location.href.replace(/\/[^\/]*$/, '') + '/api'
const access_token = localStorage.getItem('token') || null

document.addEventListener('DOMContentLoaded', function (event) {
    verificarAutenticacao()
})

const urlsSemAutenticacao = [
    "index",
    "cadastro_login"
];

function urlNaoRequerAutenticacao(url) {
    return urlsSemAutenticacao.some(urlSemAutenticacao => url.endsWith('/'+urlSemAutenticacao+'.html'));
}

function verificarAutenticacao() {
    const urlAtual = window.location.pathname;
    if (!urlNaoRequerAutenticacao(urlAtual) && !access_token ) {
        window.location.href = "index.html";
    }
}

function fazerLogout() {
    localStorage.removeItem('token');

    window.location.href = 'index.html';
}

/*
    * Métodos para redirecionar o usuário que não estiver com token
    * Para caso tente acessar rotas sem fazer login
    * Age em todas as rotas menos /index (login) e /cadastro_login (registro)
*/