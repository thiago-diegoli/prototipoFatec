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
    let produto = {} // Objeto prestador
    produto = {
        "nome": document.getElementById('produtoDesejadoInput').value,
        "quantidade": document.getElementById('quantidade').value,
        "preco": document.getElementById('preco').value,
        "descricao": document.getElementById('description').value,
        "data": new Date()
    } 
    salvarProduto(produto)
})

async function salvarProduto(produto){
    await fetch(`${urlBase}/produtos`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produto)
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