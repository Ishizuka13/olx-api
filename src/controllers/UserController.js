const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { validationResult, matchedData } = require('express-validator');

const State = require('../models/State');
const User = require('../models/User');
const Category = require('../models/Category');
const Ad = require('../models/Ad');

module.exports = {
    // Mostrar todos os  estados(presentes no database)
    getStates: async (req, res) => {
        let states = await State.find();
        res.json({states});
    },
    // Mostra todas as informações do usuário, até os anúncios
    info: async (req, res) => {
        let token = req.query.token;

        const user = await User.findOne({token});
        const state = await State.findById(user.state);
        const ads = await Ad.find({idUser: user._id.toString()});

        let adList = [];
        for(let i in ads) {
        const cat = await Category.findById(ads[i].category);
            adList.push({ ...ads[i], category: cat.slug});
        }

        res.json({
            name: user.name,
            email: user.email,
            state: state.name,
            ads: adList
        })
    },
    // Edita as informações do usuário
    editAction: async (req, res) => {
        // Mostra os erros
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.json({error: errors.mapped()});
            return;
        }
        const data = matchedData(req);

        let updates = {}; // Váriavel para armazenar as alterações

        if(data.name) { // Para alterar o nome
            updates.name = data.name;
        }

        if(data.email) { // Para alterar o email, também verifica se o email novo é igual ao anterior, se for, a alteração não acontece
            const emailCheck = await User.findOne({email: data.email});
            if(emailCheck) {
                res.json({error: 'E-mail já existente!'});
                return;
            }
            updates.email = data.email;
        }

        if(data.state) { // Para alterar o estado, verifica se o estado novo existe no database e se o código do objeto state é válido
            if(mongoose.Types.ObjectId.isValid(data.state)) {        

                const stateCheck = await State.findById(data.state);
                if(!stateCheck) {
                    res.json({error: 'Estado não existe'});
                    return;
                }
                updates.state = data.state;
            } else {
                res.json({error: 'Código de estado inválido'});
                return;
            }
        }

        if(data.password) { // Para alterar a senha
            updates.passwordHash = await bcrypt.hash(data.password, 10);
        }

        // encontra o usuário(pelo token) que terá suas informações alteradas e troca os valores atuais dos objetos pelos valores presentes na variável updates 
        await User.findOneAndUpdate({token: data.token}, {$set: updates});

        res.json({});
    }
};