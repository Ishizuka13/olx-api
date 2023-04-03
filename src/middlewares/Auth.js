const User = require('../models/User');

module.exports = {
    private: async (req,  res, next) => {
        // Verfica se o token não está no query ou no body 
        if(!req.query.token && !req.body.token) {
            res.json({notallowed: true});
            return;
        }

        // Pega o token não importando se está na query ou no body /*
        let token ='';
        if(req.query.token) {
            token = req.query.token;
        }
        if(req.body.token) {
            token = req.body.token;
        }
        // */

        // Verifica se há token
        if(token == '') {
            res.json({notallowed: true});
            return;
        }

        // Encontra o usuário que corresponde ao token /*
        const user = await User.findOne({token});

        // Se não tiver, não será permitido
        if(!user) {
            res.json({notallowed: true});
            return;
        }
        // */
        next();
    }
};