import { db } from '../db/openDb.mjs';
import { getCartaDaId } from './daoCarte.mjs';

// Funzione che ritorna informazioni sui round di una partita
export function listRounds(partita_id){
    return new Promise((res,rej)=>{
        const sql =`SELECT stato as stato_round, carta_id, numero_round 
                    FROM partita_rounds 
                    WHERE partita_id = ?
                    ORDER BY numero_round ASC`;

        db.all(sql,[parseInt(partita_id)],(err,rows) =>{
            if(err){
                rej(err);
            }
            else{
                res(rows);
            }
        });
    });
}
// Funzione che calcola il numero del round
export function getNumRound(partita_id){
    return new Promise((res,rej)=>{
        const sql =`SELECT COUNT(*) as count 
                    FROM partita_rounds 
                    WHERE partita_id = ?`;

        db.get(sql,[parseInt(partita_id)],(err,row) =>{
            if(err){
                rej(err);
            }
            else{
                res(row.count + 1);
            }
        });
    });
}

// Funzione per inserire un nuovo round nel database
export function addRound(round){
    return new Promise((res,rej)=>{
        const sql =`INSERT INTO partita_rounds (partita_id, numero_round, carta_id, tempo_inizio, stato) 
                    VALUES (?,?,?,?,?)`;

        db.run(sql, [round.partita_id,round.numRound,round.carta_id,round.startTime,"iniziato"], function(err) {
            if (err) {
                console.error("Errore nell'inserimento del round: " + err.message);
                rej(err);
            } else {
                
                res(this.lastID);
            }
        });
    });
}

//Funzione per aggiornare il round
export function updateRound(round){
    return new Promise((res,rej)=>{
        const sql= `UPDATE partita_rounds 
                    SET stato = ? 
                    WHERE id = ?`;

        db.run(sql,[round.stato,round.id],function(err) {
            if (err) {
                console.error("Errore nella modifica del round: " + err.message);
                rej(err);
            } else {
                res(true);
            }
        })
    });
}

// Funzione che ritorna il round dato il suo id
export function getRound(round_id){
    return new Promise((res,rej)=>{
        const sql= `SELECT * 
                    FROM partita_rounds 
                    WHERE id = ?`;

        db.get(sql,[round_id],(err,row)=>{
            if(err){
                rej(err);
            }
            else if(row === undefined){
                res(null);
            }
            else{
                res(row);
            }
        });
    });
}

// Funzione che verifica la risposta data dall'utente
export async function checkRisposta(posizione, carta_id, mazzo_partita){
    let mazzo = [...mazzo_partita];
    const nuovaCarta = await getCartaDaId(carta_id);
    mazzo.push(nuovaCarta);
    mazzo.sort((a, b) => a.indice - b.indice);
    const corr = mazzo.findIndex(c=> c.id === carta_id);
    
    return corr == posizione;
}

// Funzione per verificare se è già aperto un round
export function trovaRoundAperto(partita_id,num){
    return new Promise((res,rej)=>{
        const sql =`SELECT * 
                    FROM partita_rounds 
                    WHERE partita_id = ? AND numero_round = ? AND stato = ?`;
                    
        db.get(sql,[partita_id,num,"iniziato"],(err,row)=>{
            if(err){
                rej(err);
            }
            else if(row === undefined){
                res(null);
            }
            else{
                res(row);
            }
        });
    });
}