const urlBase = 'http://localhost:4000/api'
const access_token = localStorage.getItem('token') || null

document.addEventListener('DOMContentLoaded', function (event) {
    event.preventDefault()
    verificarAutenticacao();
    const caminhoURL = window.location.pathname;
    var partesCaminho = caminhoURL.split("/");
    var ultimaParte = partesCaminho[partesCaminho.length - 1];
    if (ultimaParte == "cadastrar"){
        var input = document.getElementById('produtoDesejadoInput');
        var sugestoesList = document.getElementById('sugestoes');
        var submitBtn = document.getElementById('pesquisarItem');

        var timeoutId;
        if(input) {
            input.addEventListener('input', function () {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(function () {
                    var prefixoTexto = input.value;

                    fetch('https://www.bec.sp.gov.br/BEC_Catalogo_ui/WebService/AutoComplete.asmx/GetItensList', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ prefixText: prefixoTexto, count: 20 })
                    })
                        .then(function (response) {
                            if (response.ok) {
                                return response.json();
                            }
                            throw new Error('Erro ao obter dados do servidor.');
                        })
                        .then(function (data) {
                            sugestoes.innerHTML = '';
                            data.d.forEach(function (item) {
                                var listaItems = document.createElement('li');
                                listaItems.textContent = item;
                                sugestoes.appendChild(listaItems);
                                listaItems.addEventListener('click', function() {
                                    input.value = item;
                                    sugestoes.innerHTML = '';
                                });
                            });
                            sugestoes.classList.remove('hidden');
                        })
                        .catch(function (error) {
                            console.error(error.message);
                        });
                }, 1000);
            });
        }
        if(submitBtn){
            submitBtn.addEventListener('click', function (event) {
                var descricaoInput = input.value.trim();

                var url = 'https://www.bec.sp.gov.br/BEC_Catalogo_ui/CatalogoPesquisa3.aspx?chave=&pesquisa=Y&cod_id=&ds_item=' + encodeURIComponent(descricaoInput);

                fetch(url)
                    .then(function (response) {
                        if (response.ok) {
                            return response.text();
                        }
                        throw new Error('Erro ao obter dados da página.');
                    })
                    .then(function (html) {
                        var parser = new DOMParser();
                        var doc = parser.parseFromString(html, 'text/html');
                        var conteudoPesquisa = doc.getElementById('ContentPlaceHolder1_gvResultadoPesquisa_lbTituloItem_0');

                        if (conteudoPesquisa) {
                            var descricaoInput2 = conteudoPesquisa.innerHTML.split(" ")[0]
                            var url2 = 'https://www.bec.sp.gov.br/BEC_Catalogo_ui/CatalogDetalheNovo.aspx?chave=&cod_id=' + encodeURIComponent(descricaoInput2) + '&selo=&origem=CatalogoPesquisa3'
                            fetch(url2)
                                .then(function (response2) {
                                    if (response2.ok) {
                                        return response2.text();
                                    }
                                    throw new Error('Erro ao obter dados da página.');
                                })
                                .then(function (html) {
                                    var parser2 = new DOMParser();
                                    var doc2 = parser2.parseFromString(html, 'text/html');
                                    var codigoMaterial = doc2.getElementById('ContentPlaceHolder1_lbNElementoDespesaInfo');
                                    var material = doc2.getElementById('ContentPlaceHolder1_lbMaterialInfo');

                                    if (codigoMaterial && material) {
                                        document.getElementById('informacoes').style.display = "block";
                                        var p1 = document.getElementById('p1');
                                        var p2 = document.getElementById('p2');
                                        
                                        p1.innerHTML = material.innerHTML
                                        p2.innerHTML = codigoMaterial.innerHTML
                                    } else {
                                        console.error('Elemento não encontrado');
                                    }
                                })
                                .catch(function (error) {
                                    console.error(error.message);
                                });
                        } else {
                            console.error('Div com ID ContentPlaceHolder1_gvResultadoPesquisa_lbTituloItem_0 não encontrada.');
                        }
                    })
                    .catch(function (error) {
                        console.error(error.message);
                    });
            });
        }
    }
});

const requisicaoForm = document.getElementById('requisicao');

if (requisicaoForm) {
    requisicaoForm.addEventListener('submit', function (event){
        event.preventDefault();
        let produto = {};
        produto = {
            "nome": document.getElementById('produtoDesejadoInput').value,
            "quantidade": document.getElementById('quantidade').value,
            "preco": document.getElementById('preco').value,
            "descricao": document.getElementById('description').value,
            "data": new Date()
        }; 
        salvarProduto(produto);
    });
}

//filtro
async function filtrarProduto() {
    const qtdMin = document.getElementById('qtdMin').value;
    const qtdMax = document.getElementById('qtdMax').value;
    const precoMin = document.getElementById('precoMin').value;
    const precoMax = document.getElementById('precoMax').value;

    const filtros = {};

    if (qtdMin !== '') {
        filtros.qtdMin = qtdMin;
    }
    if (qtdMax !== '') {
        filtros.qtdMax = qtdMax;
    }
    if (precoMin !== '') {
        filtros.precoMin = precoMin;
    }
    if (precoMax !== '') {
        filtros.precoMax = precoMax;
    }

    try {
        const queryString = new URLSearchParams(filtros).toString();
        if(queryString !== ''){
            const response = await fetch(`${urlBase}/produtos/filtros/?${queryString}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': access_token
                }
            });
            if (!response.ok) {
                throw new Error('Erro ao buscar os produtos filtrados');
            }

            const data = await response.json();
            const tabela = document.getElementById('dadosTabela');
            tabela.innerHTML = '';

            data.forEach(produto => {
                tabela.innerHTML += `
                    <tr class="odd:bg-white even:bg-gray-50">
                        <td class="px-6 py-4">${produto.nome}</td>
                        <td class="px-6 py-4">${produto.quantidade}</td>
                        <td class="px-6 py-4">${produto.preco}</td>
                        <td class="px-6 py-4">${produto.descricao}</td>
                        <td class="px-6 py-4">${new Date(produto.data).toLocaleDateString()}</td>
                        <td class="px-6 py-4">
                            <div class="flex flex-row justify-center">
                                <button class='max-w-20 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1.5 me-2 text-center' onclick="abrirModal('${produto._id}')">Editar&nbsp;</button>
                                <button class='max-w-20 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-1.5 text-center' onclick="removeProduto('${produto._id}')">Excluir</button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        } else {
            carregaProdutos();
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}


async function salvarProduto(produto){
    await fetch(`${urlBase}/produtos`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'access-token': access_token
        },
        body: JSON.stringify({
            nome: produto.nome,
            preco: parseFloat(produto.preco),
            quantidade: parseInt(produto.quantidade),
            descricao: produto.descricao,
            data: produto.data
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.acknowledged){
            alert('Produto incluido com sucesso!')
            //limpamos o fomulario
            document.getElementById('requisicao').reset()
            //atualizamos a listagem
            //carregaProdutos()
        }else if (data.errors){
            const errorMessages = data.errors.map(error => error.msg).join('\n')
            alert(errorMessages)
        }
    })
}

async function carregaProdutos(filtros = {}) {
    const tabela = document.getElementById('dadosTabela');
    tabela.innerHTML = '';

    try {
        let url = `${urlBase}/produtos/`;
        const params = new URLSearchParams(filtros);
        if (Object.keys(filtros).length > 0) {
            url = `${urlBase}/produtos/filtros/?${params}`;
        }
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'access-token': access_token
            }
        });
        if (!response.ok) {
            throw new Error('Erro ao buscar os produtos filtrados');
        }

        const data = await response.json();

        data.forEach(produto => {
            tabela.innerHTML += `
                <tr class="odd:bg-white even:bg-gray-50">
                    <td class="px-6 py-4">${produto.nome}</td>
                    <td class="px-6 py-4">${produto.quantidade}</td>
                    <td class="px-6 py-4">${produto.preco}</td>
                    <td class="px-6 py-4">${produto.descricao}</td>
                    <td class="px-6 py-4">${new Date(produto.data).toLocaleDateString()}</td>
                    <td class="px-6 py-4">
                        <div class="flex flex-row justify-center">
                            <button class='max-w-20 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1.5 me-2 text-center' onclick="abrirModal('${produto._id}')">Editar&nbsp;</button>
                            <button class='max-w-20 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-1.5 text-center' onclick="removeProduto('${produto._id}')">Excluir</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Erro:', error);
    }
}


async function removeProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        await fetch(`${urlBase}/produtos/${id}`, {
            method: "DELETE",
            header: {
                'Content-Type': 'application/json',
                'access-token': access_token
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.deletedCount === 1) {
                alert('Produto excluído com sucesso!');
                carregaProdutos();
            } else {
                alert('Falha ao excluir o produto.');
            }
        })
        .catch(error => {
            console.error('Erro ao excluir o produto:', error);
            alert('Erro ao excluir o produto.');
        });
    }
}




async function abrirModal(id) {
    const produtoObj = await obterProdutoPorId(id);
    const produto = produtoObj[0]
    if (produto) {
        document.getElementById('editId').value = produto._id;
        document.getElementById('editNome').value = produto.nome;
        document.getElementById('editQuantidade').value = produto.quantidade;
        document.getElementById('editPreco').value = produto.preco;
        document.getElementById('editDescricao').value = produto.descricao;
        document.getElementById('modal').classList.remove('hidden');
    }
}

function fecharModal() {
    document.getElementById('modal').classList.add('hidden');
}

async function editarProduto() {
    try {
        const produtoEditado = {
            _id: document.getElementById('editId').value,
            nome: document.getElementById('editNome').value,
            quantidade: document.getElementById('editQuantidade').value,
            preco: document.getElementById('editPreco').value,
            descricao: document.getElementById('editDescricao').value
        };

        const response = await fetch(`${urlBase}/produtos`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'access-token': access_token
            },
            body: JSON.stringify(produtoEditado)
        });

        if (!response.ok) {
            throw new Error('Erro ao editar o produto.');
        }

        const produtoAtualizado = await response.json();
        fecharModal();
        carregaProdutos();
        return produtoAtualizado;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}


async function obterProdutoPorId(id) {
    try {
        const response = await fetch(`${urlBase}/produtos/id/${id}`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'access-token': access_token
            }
        });
        if (!response.ok) {
            throw new Error('Erro ao obter detalhes do produto.');
        }
        const produto = await response.json();
        return produto;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}





//Parte do login
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

function fazerLogout() {
    localStorage.removeItem('token');

    window.location.href = 'index.html';
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


// Funções para redirecionar para o index.html caso não possua o token

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