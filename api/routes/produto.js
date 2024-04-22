import express from 'express'
import {connectToDatabase} from '../utils/mongodb.js'
import {check, validationResult} from 'express-validator'

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'produtos'


const validaProduto = [
    check('nome')
     .not().isEmpty().trim().withMessage('É obrigatório informar o nome')
     .isAlphanumeric('pt-BR', {ignore: '/. '}).withMessage('A razão social não pode conter caracteres especiais'),
    check('quantidade')
     .not().isEmpty().trim().withMessage('A quantidade é obrigatória')
     .isNumeric().withMessage('A quantidade deve ter apenas números'),
    check('preco')
    .not().isEmpty().trim().withMessage('A quantidade é obrigatória')
    .isNumeric().withMessage('A quantidade deve ter apenas números'),
    check('descricao').notEmpty().withMessage('A descricao é obrigatoria'),  
]

//GET /api/produtos
//param.: limit, skip e order
router.get('/', async (req, res) => {
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
router.get('/id/:id', async (req, res) => {
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
router.get('/filtros/', async (req, res) => {
    const { qtdMin, qtdMax, precoMin, precoMax} = req.query;
    const filtroQtd = {
                $and: [ //GET api/produtos/filtros/?qtdMin=x&qtdMax=y
                    { 'quantidade': { $gte: req.query.qtdMin } },
                    { 'quantidade': { $lte: req.query.qtdMax } }
                ]
    };
    const filtroPreco = {
                $and: [
                    { 'preco': { $gte: req.query.precoMin } },
                    { 'preco': { $lte: req.query.precoMax } }
                ]
    };
    try {
        const docs = await db.collection(nomeCollection)
            .find({
                $and: [filtroQtd, filtroPreco]
            })
            .toArray();

        res.status(200).json(docs);
    } catch (err) {
        res.status(500).json({
            erros: [{
                value: `${err.message}`,
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


router.post('/', validaProduto,  async(req, res) => {
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }
        const produto = await db.collection(nomeCollection).insertOne(req.body)
        res.status(201).json(produto) //201 é o status created
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

router.put('/', validaProduto, async(req, res) => {
    let idDocumento = req.body._id
    delete req.body._id
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }
        const produto = await db.collection(nomeCollection).updateOne({'_id': {$eq: new ObjectId(idDocumento)}},
        {$set: req.body})
        res.status(202).json(produto)  
    } catch (err){
        res.status(500).json({errors: err.message})
    }
})
export default router