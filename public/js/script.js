// urlBase já está declarada em verifica_logado.js

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
                method: "GET",
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
            quantidade: parseInt(document.getElementById('editQuantidade').value),
            preco: parseFloat(document.getElementById('editPreco').value),
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