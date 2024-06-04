/*
* Testes na API de Produtos
* Tecnologias utilizadas:
* Supertest: Biblioteca para testes na API Rest do NodeJS
* dotenv: Biblioteca para gerenciar variáveis de ambiente
*/
const request = require('supertest')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
dotenv.config()

const baseURL = 'http://localhost:4000/api'

describe('API REST de Produtos sem o Token JWT', ()=>{
  it('GET / - Lista todos os produtos sem o token', async()=> {
    const response = await request(baseURL)
    .get('/produtos')
    .set('Content-Type', 'application/json')
    .expect(401)
  })

 it('GET / Obtém o Produto pelo ID sem o token', async() => {
    const id = '66396fb6a02f8ca0a8c5f60d'
    const response = await request(baseURL)
    .get(`/produtos/id/${id}`)
    .set('Content-Type','application/json')
    .expect(401)
 }) 

 it('GET / Obtém o Produto com filtro sem o token', async() => {
    const qtdMin = 0
    const qtdMax = 0
    const precoMin = 0
    const precoMax = 0
    const response = await request(baseURL)
    .get(`/produtos/filtros/?qtdMin=${qtdMin}&qtdMax=${qtdMax}&precoMin=${precoMin}&precoMax=${precoMax}`)
    .set('Content-Type','application/json')
    .expect(401)
 }) 
})

describe('API REST de Produtos com o Token JWT', ()=> {
    let token
    it('POST - Autenticar usuário para retornar token JWT', async() => {
        const senha = process.env.SENHA_USUARIO
        const response = await request(baseURL)
        .post('/logins/')
        .set('Content-Type','application/json')
        .send({"email":"teste@teste.com","senha": senha})
        .expect(200)

        token = response.body.access_token
        expect(token).toBeDefined()
    })

    it('GET - Listar os produtos com autenticação', async() => {
        const response = await request(baseURL)
        .get('/produtos')
        .set('Content-Type','application/json')
        .set('access-token', token)
        .expect(200)

        const produtos = response.body
        expect(produtos).toBeInstanceOf(Array)
    })

    dadosProduto = {
        "nome": "Caneta Aplicadora de Insulina",
        "quantidade": 3,
        "preco": 44.00,
        "descricao": "Caneta Aplicadora de Insulina",
        "data": new Date()
    }

    it('POST - Inclui um novo produto com autenticação', async() => {
        const response = await request(baseURL)
        .post('/produtos')
        .set('Content-Type','application/json')
        .set('access-token', token)
        .send(dadosProduto)
        .expect(201)

        expect(response.body).toHaveProperty('acknowledged')
        expect(response.body.acknowledged).toBe(true)

        expect(response.body).toHaveProperty('insertedId')
        expect(typeof response.body.insertedId).toBe('string')
        idProdutoInserido = response.body.insertedId
        expect(response.body.insertedId.length).toBeGreaterThan(0)
    })

    it('GET /:id - Lista o produto pelo id com token', async() => {
        const response = await request(baseURL)
        .get(`/produtos/id/${idProdutoInserido}`)
        .set('Content-Type','application/json')
        .set('access-token', token)
        .expect(200)
    })

    it('GET /:razao - Lista o produto pelo filtro com token', async() => {
        const qtdMin = dadosProduto.quantidade -1
        const qtdMax = dadosProduto.quantidade
        const precoMin = dadosProduto.preco -1
        const precoMax = dadosProduto.preco
        const response = await request(baseURL)
        .get(`/produtos/filtros/?qtdMin=${qtdMin}&qtdMax=${qtdMax}&precoMin=${precoMin}&precoMax=${precoMax}`)
        .set('Content-Type','application/json')
        .set('access-token', token)
        .expect(200)
    })

    it('PUT - Altera os dados do produto', async()=> {
        novoDadosProduto = {
            ...dadosProduto,
            '_id' : idProdutoInserido
        }
        novoDadosProduto.nome += ' alterado'
        const response = await request(baseURL)
        .put('/produtos')
        .set('Content-Type','application/json')
        .set('access-token', token)
        .send(novoDadosProduto)
        .expect(202)

        expect(response.body).toHaveProperty('acknowledged')
        expect(response.body.acknowledged).toBe(true)

        expect(response.body).toHaveProperty('modifiedCount')
        expect(typeof response.body.modifiedCount).toBe('number')
        expect(response.body.modifiedCount).toBeGreaterThan(0)
    })

    it('DELETE - Remove o produto', async() => {
        const response = await request(baseURL)
        .delete(`/produtos/${idProdutoInserido}`)
        .set('Content-Type','application/json')
        .set('access-token', token)
        .expect(200)

        expect(response.body).toHaveProperty('acknowledged')
        expect(response.body.acknowledged).toBe(true)

        expect(response.body).toHaveProperty('deletedCount')
        expect(typeof response.body.deletedCount).toBe('number')
        expect(response.body.deletedCount).toBeGreaterThan(0)
    })

    it('POST - Insere um produto sem o nome', async() => {
        dadosProduto.nome = ''
        const response = await request(baseURL)
        .post('/produtos')
        .set('Content-Type','application/json')
        .set('access-token', token)
        .set(dadosProduto)
        .expect(400)
    
        expect(response.body).toHaveProperty('errors')
        const avisoErro = response.body.errors[0].msg
    
        expect(avisoErro).toEqual('É obrigatório informar o nome')
    })
})

describe('API REST de Usuários', () => {
    it('POST - Cadastrar usuário com senha fraca', async() => {
        const dadosUsuario = {
            "nome": "Usuário Teste",
            "email": "novousuario@teste.com",
            "senha": "123" // senha fraca, menos de 6 caracteres
        }

        const response = await request(baseURL)
        .post('/logins/cadastro')
        .set('Content-Type','application/json')
        .send(dadosUsuario)
        .expect(400)

        expect(response.body).toHaveProperty('errors')
        const avisoErro = response.body.errors[0].msg

        expect(avisoErro).toEqual('A senha deve ter pelo menos 6 caracteres')
    })

    it('POST - Cadastrar usuário com uma senha aceitável', async() => {
        const dadosUsuario = {
            "nome": "Usuário Teste",
            "email": "novousuario@teste.com",
            "senha": "123abc"
        }

        const response = await request(baseURL)
        .post('/logins/cadastro')
        .set('Content-Type','application/json')
        .send(dadosUsuario)
        .expect(201)
    })

    it('POST - Cadastrar usuário com email já cadastrado', async() => {
        const dadosUsuario = {
            "nome": "Usuário Teste",
            "email": "novousuario@teste.com",
            "senha": "123abc"
        }

        const response = await request(baseURL)
        .post('/logins/cadastro')
        .set('Content-Type','application/json')
        .send(dadosUsuario)
        .expect(409)

        expect(response.body).toHaveProperty('errors')
        const avisoErro = response.body.errors[0].msg

        expect(avisoErro).toEqual('O email informado já está cadastrado')
    })

    it('POST - Tentar logar com email inválido', async() => {
        const dadosLogin = {
            "email": "emailinvalido",
            "senha": process.env.SENHA_USUARIO
        }

        const response = await request(baseURL)
        .post('/logins/')
        .set('Content-Type','application/json')
        .send(dadosLogin)
        .expect(400)

        expect(response.body).toHaveProperty('errors')
        const avisoErro = response.body.errors[0].msg

        expect(avisoErro).toEqual('O email informado não é válido')
    })
})

describe('API REST de Produtos com o Token JWT', () => {
    let token;

    beforeAll(async () => {
        const response = await request(baseURL)
            .post('/logins/')
            .set('Content-Type', 'application/json')
            .send({ "email": "teste@teste.com", "senha": process.env.SENHA_USUARIO })
            .expect(200);

        token = response.body.access_token;
        expect(token).toBeDefined();
    });

    it('Verifica se o token JWT contém as informações do usuário e a data de expiração', () => {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

        expect(decodedToken).toHaveProperty('userId');
        expect(decodedToken).toHaveProperty('exp');
        expect(decodedToken).toHaveProperty('iat');

        const userId = decodedToken.userId;
        expect(userId).toBeDefined();
        expect(typeof userId).toBe('string');
    });
});