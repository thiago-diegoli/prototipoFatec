const urlBase = 'http://localhost:4000/api'
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