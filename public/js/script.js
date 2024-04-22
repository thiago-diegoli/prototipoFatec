const urlBase = 'http://localhost:4000/api'

document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('produtoDesejadoInput');
    var sugestoesList = document.getElementById('sugestoes');
    var submitBtn = document.getElementById('pesquisarItem');

    var timeoutId;

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
                    sugestoesList.innerHTML = '';
                    data.d.forEach(function (item) {
                        var option = document.createElement('option');
                        option.value = item;
                        sugestoesList.appendChild(option);
                    });
                })
                .catch(function (error) {
                    console.error(error.message);
                });
        }, 1000);
    });

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
});



document.getElementById('requisicao').addEventListener('submit', function (event){
    event.preventDefault() // evita o carregamento
    let produto = {} // Objeto produto
    produto = {
        "nome": document.getElementById('produtoDesejadoInput').value,
        "quantidade": document.getElementById('quantidade').value,
        "preco": document.getElementById('preco').value,
        "descricao": document.getElementById('description').value,
        "data": new Date()
    } 
    salvarProduto(produto)
})

//filtro
async function filtrarProduto() {
    console.log('Botão de filtrar clicado');

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
            const response = await fetch(`${urlBase}/produtos/filtros/?${queryString}`);
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
            'Content-Type': 'application/json'
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
            document.getElementById('mensagem').innerHTML = `<span class='text-danger'>${errorMessages}</span>`
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
                'Content-Type': 'application/json'
            }
        });
        console.log(response)
        if (!response.ok) {
            throw new Error('Erro ao buscar os produtos filtrados');
        }

        const data = await response.json();
        console.log(data)

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
        // Trate o erro de acordo com o que você deseja fazer no front-end
    }
}


async function removeProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        await fetch(`${urlBase}/produtos/${id}`, {
            method: "DELETE",
            header: {
                'Content-Type': 'application/json'
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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(produtoEditado)
        });

        if (!response.ok) {
            console.log(response);
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
        const response = await fetch(`${urlBase}/produtos/id/${id}`);
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
