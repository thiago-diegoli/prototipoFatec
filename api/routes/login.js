import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import {check, validationResult} from 'express-validator'

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'logins'
let usuarios = [];

const validaLogin = [
    check('email')
        .notEmpty().withMessage('O email é obrigatório')
        .isEmail().withMessage('O email informado não é válido'),
    check('senha')
        .notEmpty().withMessage('A senha é obrigatória')
        .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres')
];

const validaCadastro = [
    check('nome')
        .notEmpty().withMessage('O nome é obrigatório'),
    check('email')
        .notEmpty().withMessage('O email é obrigatório')
        .isEmail().withMessage('O email informado não é válido')
        .custom(async (email) => {
            const usuarioExistente = await db.collection(nomeCollection).findOne({ email });
            if (usuarioExistente) {
                throw new Error('O email informado já está cadastrado');
            }
        }),
    check('senha')
        .notEmpty().withMessage('A senha é obrigatória')
        .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres')
];

router.post('/cadastro', validaCadastro, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(409).json({errors: errors.array()})  
        }
        const { nome, email, senha } = req.body;
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        const usuario = await db.collection(nomeCollection).insertOne({ nome, email, senha: senhaCriptografada });
        res.status(201).json(usuario);
    } catch(err) {
        res.status(500).json({message: `${err.message} Erro no server`})

    }
});

router.post('/', validaLogin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, senha } = req.body;
        const usuario = await db.collection(nomeCollection).findOne({ email });

        if (!usuario) {
            return res.status(401).json();
        }

        const senhaCorrespondente = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorrespondente) {
            return res.status(401).json();
        }
        const token = jwt.sign({ userId: usuario._id }, 'chave_secreta', { expiresIn: '1h' });
        res.status(200).json({
            token,
            nome: usuario.nome,
            email: usuario.email
        });
    } catch(err) {
        res.status(500).json({ message: `${err.message} Erro no server` });
    }
});
export default router