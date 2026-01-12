// imports
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import {check, validationResult,param} from 'express-validator';
import {getUtente, getNomeUtente } from './dao/daoUtenti.mjs';
import {addPartita, partitaStat, getPartita, updatePartita,listPartite } from './dao/daoPartite.mjs';
import {getNumRound, addRound, getRound, updateRound, checkRisposta, trovaRoundAperto, listRounds } from './dao/daoRounds.mjs';
import {getCarte, getCartaDaId, addCarta, getMazzo, getCarteDemo, getPrimeCarte } from './dao/daoCarte.mjs';
import {Round, Carta, Partita} from './models/models.mjs'

// init express
const app = new express();
const port = 3001;

// middleware
app.use(express.json());

app.use('/img', express.static('public/img'));

app.use(morgan('dev'));

const corsOptions = {
    origin: 'http://localhost:5173',
    optionSuccessStatus: 200, // supporto browser legacy
    credentials : true 
};
app.use(cors(corsOptions));

passport.use(new LocalStrategy(async function verify(username,password,callback){
  const user = await getUtente(username,password);
  if(!user){
    return callback(null,false,"Credenziali errate");
  }
  return callback(null,user);
}));

passport.serializeUser((user,callback)=>{
  callback(null,user);
});

passport.deserializeUser((user,callback)=>{
  callback(null,user);
});

app.use(session({
  secret: "top secret...",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.authenticate('session'));

const isLoggato = (req,res,next)=>{
  if(req.isAuthenticated()){
    return next();
  }
  return res.status(401).json({error: 'non autorizzato'});

}

/* ROUTES */

// POST /api/utenti/<uid>/partite
app.post('/api/utenti/:uid/partite',[
  param('uid').isInt().withMessage('ID utente non valido'),
],isLoggato, async  (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const utente_id = req.params.uid;

  try{
    const u = await getNomeUtente(utente_id);
    if(!u){
      res.status(404).json({ error: 'Utente non trovato' });
      return;
    }
   
    if (u.username !== req.user.username) {
      res.status(401).json({ error: 'Non sei autorizzato a farlo' });
      return;
    }
    const partitaId = await addPartita(utente_id);
    const mazzo= await getCarte(partitaId);
    mazzo.sort((a,b)=> a.indice - b.indice);
    for(let i=0;i<3;i++){
      await addCarta(new Carta(partitaId,mazzo[i].id,0));
    }
    
    res.status(201).json({ partita_id: partitaId, 
                           mazzo: mazzo
                          });
    return;
  }
  catch(err){
    console.error("Errore nella creazione della partita: " + err.message);
    res.status(500).json({ error: "Impossibile creare la partita" });
    return;
  }  
}); 

// POST /api/partite/<pid>/rounds
app.post('/api/partite/:pid/rounds',[
  param('pid').isInt().withMessage('ID partita non valido')
], isLoggato, async (req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const partita_id= req.params.pid;
  try{
    const p = await getPartita(partita_id);
    if (!p) {
      res.status(404).json({ error: 'Partita non trovata' });
      return;
    }
    const u = await getNomeUtente(p.utente_id);
    if(!u){
      res.status(404).json({ error: 'Utente non trovato' });
      return;
    }
    if (u.username !== req.user.username) {
      res.status(401).json({ error: 'Non sei autorizzato a farlo' });
      return;
    }
    
    if (p.stato !== "non terminata") {
      res.status(503).json({ error: 'Partita terminata' });
      return;
    }
    const num = await getNumRound(partita_id);
    const roundEsistente = await trovaRoundAperto(partita_id,num-1);
    if (roundEsistente) {
      const c = await getCartaDaId(roundEsistente.carta_id);
      res.json({round_id: roundEsistente.id, carta: {id: c.id, nome: c.nome, immagine: c.immagine }});
      return;
    }
    const carte = await getCarte(partita_id);
    const carta= carte[0];
    
    const startTime = Date.now();
    const round = new Round(partita_id,num,carta.id,startTime);
    const roundId = await addRound(round);
    res.status(201).json({round_id: roundId, carta: {id: carta.id, nome: carta.nome, immagine: carta.immagine }});
    return;
  }
  catch(err){
    console.error("Errore nella creazione del round: " + err.message);
    res.status(500).json({ error: "Impossibile creare il round" });
    return;
  }
});

// PUT /api/partite/<pid>/rounds/<rid>/risposta
app.put('/api/partite/:pid/rounds/:rid/risposta',[
  param('pid').isInt().withMessage('ID partita non valido'),
  param('rid').isInt().withMessage('ID round non valido'),
  check('posizione').isInt({min: -1}).withMessage('Posizione non valida')
], isLoggato, async (req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const partita_id= req.params.pid;
  const round_id= req.params.rid;
  try{
    const p = await getPartita(partita_id);
    if (!p) {
      res.status(404).json({ error: 'Partita non trovata' });
      return;
    }
    const u = await getNomeUtente(p.utente_id);
    if(!u){
      res.status(404).json({ error: 'Utente non trovato' });
      return;
    }
    if (u.username !== req.user.username) {
      res.status(401).json({ error: 'Non sei autorizzato a farlo' });
      return;
    }
    if (p.stato !== "non terminata") {
      res.status(503).json({ error: 'Partita terminata' });
      return;
    }
    const round = await getRound(round_id);
    if(!round){
      res.status(404).json({ error: 'Round non trovato' });
      return;
    }
    const tempo = Date.now();
    const trascorso = tempo - round.tempo_inizio;
    const risposta = req.body.posizione;
    if(trascorso>31500 || risposta === -1){
      round.stato="perso";
      await updateRound(round);
      const stat = await partitaStat(partita_id);
      if(stat.sconfitte>=3){
        await updatePartita(partita_id,"persa");
        res.json({msg: "Tempo scaduto, purtroppo questo era l'ultimo errore che potevi fare. La partita è persa ☹️😪", stato: "perso", partita: "persa"});
        return;
      }
      else{
        res.json({msg: "Oh nooooooooo il tempo è scaduto e non hai dato una risposta, cerca di essere più veloce il prossimo round! 🕙☹️", stato: "perso", partita: "in corso"});
        return;
      }   
    }
    const mazzo = await getMazzo(partita_id);
    if(await checkRisposta(risposta,round.carta_id,mazzo)){
      round.stato="vinto";
      await updateRound(round);
      const vintaId = await addCarta(new Carta(partita_id,round.carta_id,round.numero_round));
      
      const stat = await partitaStat(partita_id);
      if(stat.vittorie>=3){
        await updatePartita(partita_id,"vinta");
        res.json({msg: "Risposta corretta, hai vinto il round e non solo! Hai vinto la partita 🥳🤩🎉", stato: "vinto", partita: "vinta"});
        return;
      }
      else{
        res.json({msg: "Risposta corretta, hai vinto il round e hai guadagnato una carta in più! 🤩", stato: "vinto", partita: "in corso"});
        return;
      }
    }
    else{
      round.stato="perso";
      await updateRound(round);
      const stat = await partitaStat(partita_id);
      if(stat.sconfitte>=3){
        await updatePartita(partita_id,"persa");
        res.json({msg: "Risposta errata, purtroppo hai perso il round. Le brutte notizie non finiscono qui, questo era il terzo errore quindi la partita è persa ☹️😪", stato: "perso", partita: "persa"});
        return;
      }
      else{
        res.json({msg: "Risposta errata, purtroppo hai perso il round ☹️", stato: "perso", partita: "in corso"});
        return;
      }
    }
  }
  catch(err){
    console.error("Errore nella risposta del round: " + err.message);
    res.status(500).json({ error: "Impossibile completare il round" });
    return;
  }
});

// GET api/partite/<pid>/stats
app.get('/api/partite/:pid/stats', [
  param('pid').isInt().withMessage('ID partita non valido')
], isLoggato, async (req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const partita_id = req.params.pid;
  try{
    const partita = await getPartita(partita_id);
    if (!partita) {
      res.status(404).json({ error: 'Partita non trovata' });
      return;
    }
    const u = await getNomeUtente(partita.utente_id);
    if(!u){
      res.status(404).json({ error: 'Utente non trovato' });
      return;
    }
    if (u.username !== req.user.username) {
      res.status(401).json({ error: 'Non sei autorizzato a farlo' });
      return;
    }
    const stats= await partitaStat(partita_id);
    res.json({vittorie: stats.vittorie, sconfitte: stats.sconfitte});
    return;
  }
  catch(err){
    console.error("Errore nel calcolo delle statistiche: " + err.message);
    res.status(500).json({ error: "Impossibile inviare le statistiche" });
    return;
  }
});

// GET /api/partite/<pid>/mazzo

app.get('/api/partite/:pid/mazzo',[
  param('pid').isInt().withMessage('ID partita non valido')
], isLoggato, async (req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const partita_id = req.params.pid;
  try{
    const partita = await getPartita(partita_id);
    if (!partita) {
      res.status(404).json({ error: 'Partita non trovata' });
      return;
    }
    const u = await getNomeUtente(partita.utente_id);
    if(!u){
      res.status(404).json({ error: 'Utente non trovato' });
      return;
    }
    if (u.username !== req.user.username) {
      res.status(401).json({ error: 'Non sei autorizzato a farlo' });
      return;
    }
    const mazzo = await getMazzo(partita_id);
    res.json({mazzo});
    return;
  }
  catch(err){
    console.error("Errore nel recupero del mazzo: " + err.message);
    res.status(500).json({ error: "Impossibile inviare le carte del mazzo" });
    return;
  }
});

// GET /api/demo/partita

app.get('/api/demo/partita', async (req,res)=>{
  try{
    const carte= await getCarteDemo();
    const mazzo= [];
    const tempo_inizio = Date.now();
    mazzo.push(carte[0]);
    mazzo.push(carte[1]);
    mazzo.push(carte[2]);
    mazzo.sort((a,b)=> a.indice - b.indice);  
    res.json({  
              mazzo: mazzo,
              carta_round: {id: carte[3].id, nome: carte[3].nome, immagine: carte[3].immagine},
              tempo_inizio
            });
    return;
  }
  catch(err){
    console.error("Errore nella creazione della partita demo: " + err.message);
    res.status(500).json({ error: "Impossibile creare la partita demo" });
    return;
  }
});

// PUT /api/demo/risposta
app.put('/api/demo/risposta', [
  check('risposta').isInt({min: -1}).withMessage('Risposta non valida'),
  check('mazzo').isArray().withMessage('Mazzo non valido'),
  check('carta_round').isObject().withMessage('Carta del round non valida'),
  check('carta_round.id').isInt().withMessage('ID carta del round non valido'),
  check('tempo_inizio').isInt().withMessage('Tempo di inizio non valido')
],async (req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try{
    
    const mazzo= req.body.mazzo;
    const carta_round= req.body.carta_round;
    const tempo_inizio= req.body.tempo_inizio;
    const tempo_attuale = Date.now();
    const trascorso = tempo_attuale-tempo_inizio;
    const risposta = req.body.risposta;
   
    if(trascorso>31500 || risposta === -1){    
        res.json({msg: "Oh nooooooooo il tempo è scaduto e non hai dato una risposta, cerca di essere più veloce la prossima volta! 🕙☹️", stato: "perso"});
        return; 
    }
    
    if(await checkRisposta(risposta,carta_round.id,mazzo)){
      
      res.json({ msg: "Risposta corretta, hai vinto il round!!! Saresti proprio forte nel gioco vero, perchè non lo provi? 😏", stato: "vinto" });
      return;
    }
    else{
      
      res.json({ msg: "Risposta errata, mannaggia hai perso il round ☹️ Non demordere, continua ad allenarti!", stato: "perso" });
      return;
    }
  }
  catch(err){
    console.error("Errore nella risposta alla partita demo: " + err.message);
    res.status(500).json({ error: "Impossibile rispondere alla partita demo" });
    return;
  }
});

// GET /api/utenti/<uid>/partite
app.get('/api/utenti/:uid/partite',[
  param('uid').isInt().withMessage('ID utente non valido')
], isLoggato, async(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const utente_id = req.params.uid;
  try{
    const u = await getNomeUtente(utente_id);
    if(!u){
      res.status(404).json({ error: 'Utente non trovato' });
      return;
    }
    if (u.username !== req.user.username) {
      res.status(401).json({ error: 'Non sei autorizzato a farlo' });
      return;
    }
    const partite = await listPartite(utente_id);
    if(!partite){
      res.status(404).json({ error: "L'utente non ha ancora fatto partite" });
      return;
    }
    const cronologia = [];
    for(const partita of partite){
      const stats= await partitaStat(partita.id);
      const p = new Partita(partita.id,partita.esito,partita.numero_rounds,partita.data,stats.vittorie);
      const rounds = await listRounds(partita.id);
      const carteIniziali = await getPrimeCarte(partita.id);
      for (const nome_carta of carteIniziali) {
        p.carte.push({
          nome_carta: nome_carta, 
        });
      }
      for(const round of rounds){
        const c = await getCartaDaId(round.carta_id);
        p.carte.push({
          nome_carta: c.nome,
          numero_round: round.numero_round,
          esito_round: round.stato_round
        });
      }
      cronologia.push(p);
    }
    res.json(cronologia);
    return;
  }
  catch(err){
    console.error("Errore nel recupero delle partite: " + err.message);
    res.status(500).json({ error: "Impossibile recuperare la cronologia" });
    return;
  }  
});

// POST /api/sessioni
app.post('/api/sessioni',passport.authenticate('local'),(req,res)=>{
  return res.status(201).json(req.user);
});

// GET /api/sessioni/corrente
app.get('/api/sessioni/corrente',(req,res)=>{
  if(req.isAuthenticated()){
    res.json(req.user);
  }
  else{
    res.status(401).json({error: 'non autenticato'});
  }
})

// DELETE /api/sessioni/corrente
app.delete('/api/sessioni/corrente', isLoggato, (req,res)=>{
 
    req.logout(()=>{
      res.end();
    });
 
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});