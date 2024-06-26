import express from 'express'
import {connectToDatabase} from '../utils/mongodb.js'
import {check, validationResult} from 'express-validator'
import auth from '../middleware/auth.js'

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'produtos'


const validaProduto = [
    check('nome')
     .not().isEmpty().trim().withMessage('É obrigatório informar o nome'),
    check('quantidade')
     .not().isEmpty().trim().withMessage('A quantidade é obrigatória')
     .isNumeric().isLength({min: 1}).withMessage('A quantidade não pode ser menor que 1')
     .isNumeric().withMessage('A quantidade deve ter apenas números'),
    check('preco')
     .not().isEmpty().trim().withMessage('O preço é obrigatório')
     .isNumeric().isLength({min: 0}).withMessage('O preço não pode ser menor que 0')
     .isNumeric().withMessage('O preço deve ter apenas números'),
    check('descricao').notEmpty().withMessage('A descrição é obrigatoria'),  
]

//GET /api/produtos
//param.: limit, skip e order
router.get('/', auth, async (req, res) => {
    const {limit, skip, order} = req.query //Obter da URL
    try{
        const docs = []
        
        await db.collection(nomeCollection).find()
        .limit(parseInt(limit) || 10)
        .skip(parseInt(skip) || 0)
        .sort({order: 1})
        .forEach((doc) => {
            docs.push(doc)
        })
        res.status(200).json(docs)
    } catch (err){
        res.status(500).json(
            {message: 'Erro ao obter a listagem dos produtos',
             error: `${err.message}`}
        )
    }
})

//GET produtos/id/:id
router.get('/id/:id', auth, async (req, res) => {
    try {
        const docs = []
        await db.collection(nomeCollection)
            .find({'_id': {$eq: new ObjectId(req.params.id)}}, {})
            .forEach((doc) => {
                docs.push(doc)
            })
            res.status(200).json(docs)
    } catch(err){
        res.status(500).json({
            erros: [{
                value: `${err.message}`,
                msg: 'Erro ao obter o produto pelo ID',
                param: 'id/:id'
            }]
        })
    }
})

//GET filtros/?query
router.get('/filtros/', auth, async (req, res) => {
    const { qtdMin, qtdMax, precoMin, precoMax } = req.query;

    let filtroQtd = {};
    let filtroPreco = {};

    if (qtdMin !== undefined && qtdMax !== undefined) {
        filtroQtd['quantidade'] = {
            $gte: parseInt(qtdMin),
            $lte: parseInt(qtdMax)
        };
    } else {
        if (qtdMin !== undefined) {
            filtroQtd['quantidade'] = { $gte: parseInt(qtdMin) };
        }
        if (qtdMax !== undefined) {
            filtroQtd['quantidade'] = { $lte: parseInt(qtdMax) };
        }
    }
    
    if (precoMin !== undefined && precoMax !== undefined) {
        filtroPreco['preco'] = {
            $gte: parseFloat(precoMin),
            $lte: parseFloat(precoMax)
        };
    } else {
        if (precoMin !== undefined) {
            filtroPreco['preco'] = { $gte: parseFloat(precoMin) };
        }
        if (precoMax !== undefined) {
            filtroPreco['preco'] = { $lte: parseFloat(precoMax) };
        }
    }

    if (Object.keys(filtroQtd).length === 0 && Object.keys(filtroPreco).length === 0) {
        res.status(400).json({
            errors: [{
                value: 'Parâmetros inválidos',
                msg: 'É necessário fornecer pelo menos um parâmetro de filtro (quantidade ou preço)'
            }]
        });
        return;
    } else {
        if ((parseInt(qtdMin) >= parseInt(qtdMax)) || (parseFloat(precoMin) >= parseFloat(precoMax))) {
            res.status(400).json({
                errors: [{
                    value: `Parâmetros inválidos`,
                    msg: 'Os parâmetros são iguais valor mínimo maior que o máximo'
                }]
            })
            return;
        }
    }

    try {
        const cursor = await db.collection(nomeCollection).find({
            $and: [ filtroQtd, filtroPreco]
        });

        const docs = [];
        await cursor.forEach(doc => {
            docs.push(doc);
        });

        res.status(200).json(docs);
    } catch (err) {
        res.status(500).json({
            errors: [{
                value: err.message,
                msg: 'Erro ao obter o produto pelo filtro',
                param: 'filtros/'
            }]
        });
    }
});



/*
router.get('/filtros/data/:data', async (req, res)=>{
    try{
        const data = req.params.data.toString()
        const docs = []
        await db.collection(nomeCollection)
        .find({
            $or: [
                {'data' : {$regex: data, $options: 'i'}}
            ]
        })
        .forEach((doc) => {
            docs.push(doc)
        })
        res.status(200).json(docs)
    } catch(err){
        res.status(500).json({
            errors: [{
                value: `${err.message}`,
                msg: 'Erro ao obter o prroduto pelo filtro solicitado',
                param: '/filtros/:filtro'
            }]
        })
    }
})*/


router.post('/', auth, validaProduto,  async(req, res) => {
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }
        const { quantidade, preco, ...outrasProps } = req.body
        const produto = {
            quantidade: parseInt(quantidade),
            preco: parseFloat(preco),
            ...outrasProps
        }
        const resultado = await db.collection(nomeCollection).insertOne(produto)

        res.status(201).json(resultado)
    } catch (err){
        res.status(500).json({message: `${err.message} Erro no Server`})
    }
})

router.delete('/:id', async(req, res) => {
    const result = await db.collection(nomeCollection).deleteOne({
        "_id": {$eq: new ObjectId(req.params.id)}
    })
    if (result.deletedCunt === 0){
        req.status(404).json({
            errors: [{
                value: `Não há nenhum produto com o id ${req.params.id}`,
                msg: 'Erro ao excluir o produto',
                param: '/:id'
            }]
        })
    } else {
        res.status(200).json(result)
    }
})

router.put('/', auth, validaProduto, async(req, res) => {
    let idDocumento = req.body._id
    delete req.body._id
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }

        req.body.quantidade = parseInt(req.body.quantidade)
        req.body.preco = parseFloat(req.body.preco)

        const produto = await db.collection(nomeCollection).updateOne({'_id': {$eq: new ObjectId(idDocumento)}},
        {$set: req.body})
        res.status(202).json(produto)  
    } catch (err){
        res.status(500).json({errors: err.message})
    }
})
export default router