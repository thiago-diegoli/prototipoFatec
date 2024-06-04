import express from 'express'
import {config} from 'dotenv'
import fs from 'fs'
import swaggerUI from 'swagger-ui-express'
config() // carrega as variáveis do .env

const app = express()
const {PORT} = process.env
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css"

//Import das rotas da aplicação
import RotasProdutos from './routes/produto.js'
import RotasLogins from './routes/login.js'

app.use(express.json()) //Habilita o parse do JSON
//Rota de conteúdo público
app.use('/', express.static('public'))
//Removendo o x-powered by por segurança
app.disable('x-powered-by')
//Configurando o favicon
app.use('/favicon.ico', express.static('public/img/cps.png'))
//Rota default
app.get('/api', (req, res)=> {
     /* 
    * #swagger.tags = ['Default']
    * #swagger.summary = 'Rota default que retorna a versão da API'
    * #swagger.description = 'Endpoint que retorna a versão da API'    
    * #swagger.path = '/'
    * #swagger.method = 'GET'
    */
    res.status(200).json({
        message: 'API FATEC 100% funcional',
        version: '1.0.0'
    })
})
//Rotas da API
app.use('/api/produtos', RotasProdutos)
app.use('/api/logins', RotasLogins)

app.use('/api/doc', swaggerUI.serve, swaggerUI.setup(JSON.parse(fs.readFileSync('./api/swagger/swagger_output.json')), {
    customCss:
        '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL
}))


//Listen
app.listen(PORT, function(){
    console.log(`Servidor rodando na porta ${PORT}`)
})