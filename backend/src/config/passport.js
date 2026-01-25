import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import {
    buscarPorGoogleId,
    buscarUtilizadorPorEmail,
    vincularGoogle,
    criarUtilizadorGoogle
} from '../modelos/utilizadorModelo.js';

dotenv.config();

/**
 * Configuração do Passport com estratégia Google OAuth2
 */

// Estratégia Google OAuth 2.0
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
    scope: ['profile', 'email'],
    passReqToCallback: true // Permite aceder ao request para obter o state (tipo)
},
async (req, accessToken, refreshToken, profile, done) => {
    try {
        // Obter tipo de utilizador do state (passado na URL inicial)
        const tipo = req.query.state || 'docente';
        const tiposValidos = ['aluno', 'docente'];
        const tipoFinal = tiposValidos.includes(tipo) ? tipo : 'docente';

        // Obter email do perfil Google
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email) {
            return done(new Error('Não foi possível obter o email da conta Google'), null);
        }

        // 1. Verificar se já existe utilizador com este Google ID
        let utilizador = await buscarPorGoogleId(profile.id);

        if (utilizador) {
            // Utilizador já existe com Google vinculado
            return done(null, utilizador);
        }

        // 2. Verificar se email já existe (utilizador registado tradicionalmente)
        utilizador = await buscarUtilizadorPorEmail(email);

        if (utilizador) {
            // Vincular conta Google ao utilizador existente
            utilizador = await vincularGoogle(utilizador.id, profile.id);
            return done(null, utilizador);
        }

        // 3. Criar novo utilizador via Google com o tipo correto (aluno ou docente)
        utilizador = await criarUtilizadorGoogle({
            nome: profile.displayName || 'Utilizador Google',
            email: email,
            google_id: profile.id,
            tipo: tipoFinal, // Usa o tipo passado na URL (aluno ou docente)
            aprovado: false  // Mantém fluxo de aprovação do admin
        });

        return done(null, utilizador);

    } catch (erro) {
        console.error('Erro na autenticação Google:', erro);
        return done(erro, null);
    }
}));

// Serialização (não usamos sessões, mas é necessário para o Passport)
passport.serializeUser((utilizador, done) => {
    done(null, utilizador.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const { buscarUtilizadorPorId } = await import('../modelos/utilizadorModelo.js');
        const utilizador = await buscarUtilizadorPorId(id);
        done(null, utilizador);
    } catch (erro) {
        done(erro, null);
    }
});

export default passport;
