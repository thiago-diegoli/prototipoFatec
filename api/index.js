import express from 'express'
import {config} from 'dotenv'
config() // carrega as variáveis do .env

const app = express()
const {PORT} = process.env
//Import das rotas da aplicação
import RotasProdutos from './routes/produto.js'

app.use(express.json()) //Habilita o parse do JSON
//Rota de conteúdo público
app.use('/', express.static('public'))
//Removendo o x-powered by por segurança
app.disable('x-powered-by')
//Configurando o favicon
app.use('/favicon.ico', express.static('public/img/cps.png'))
//Rota default
app.get('/api', (req, res)=> {
    res.status(200).json({
        message: 'API FATEC 100% funcional',
        version: '1.0.0'
    })
})
//Rotas da API
app.use('/api/produtos', RotasProdutos)
//Listen
app.listen(PORT, function(){
    console.log(`Servidor rodando na porta ${PORT}`)
})