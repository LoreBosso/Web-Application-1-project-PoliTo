import { db } from '../db/openDb.mjs';

// Funzione che ritorna l'id di una carta casuale tra quelle non ancora utilizzate
export async function getCarte(partita_id){
    const carte = await carteUsate(partita_id);
    return new Promise((res,rej)=>{
        let sql, params;
        if(carte.length > 0){
            
          sql= `SELECT * 
                FROM carte 
                WHERE id NOT IN (${carte.map(()=>'?').join(',')}) 
                ORDER BY RANDOM() 
                LIMIT 1`;

            params = carte;
            
        } else {
         sql = `SELECT * 
                FROM carte 
                ORDER BY RANDOM() 
                LIMIT 3`;

            params = [];
        }
        db.all(sql, params, (err, rows)=>{
            if(err){
                console.error("Errore nella selezione della carta: " + err.message);
                rej(err);
            }
            else{
                res(rows);
            }
        });
    });
}

// Versione per la demo
export async function getCarteDemo(){
    return new Promise((res,rej)=>{
        const sql =`SELECT * 
                    FROM carte 
                    ORDER BY RANDOM() 
                    LIMIT 4`;

        db.all(sql,[], (err, rows)=>{
            if(err){
                console.error("Errore nella selezione delle carte per la demo: " + err.message);
                rej(err);
            }
            else{
                res(rows);
            }
        });
    });
}

// Funzione che ritorna l'elenco delle carte utilizzate in una partita
function carteUsate(partita_id){
    return new Promise((res,rej) => {
        const sql =`SELECT carta_id 
                    FROM partita_rounds 
                    WHERE partita_id = ?
                    UNION
                    SELECT carta_id 
                    FROM partita_carte 
                    WHERE partita_id = ?`;

        db.all(sql,[partita_id,partita_id],(err,rows) => {
            if(err){
                rej(err);
            }
            else{
                res(rows.map(c => c.carta_id));
            }
        });
    });
}

// Funzione che aggiunge una carta alla partita
export function addCarta(carta){
    return new Promise((res,rej)=>{
        const sql =`INSERT INTO partita_carte (partita_id, carta_id, vinta_in_round) 
                    VALUES (?,?,?)`;

        db.run(sql,[carta.partita_id,carta.carta_id,carta.vinta_in_round],function(err) {
            if (err) {
                console.error("Errore nell'inserimento della carta: " + err.message);
                rej(err);
            } else {
                
                res(this.lastID);
            }
        });
    });
}

// Funzione che ritorna la carta dato il suo id
export function getCartaDaId(id){
    return new Promise((res,rej)=>{
        const sql= `SELECT * 
                    FROM carte 
                    WHERE id = ?`;

        db.get(sql,[id],(err,row)=>{
            if(err){
                rej(err);
            }
            else{
                res(row);
            }
        });
    });
}

// Funzione che ritorna l'attuale mazzo del giocatore
export function getMazzo(partita_id){
    return new Promise((res,rej)=>{
        const sql= `
            SELECT c.*
            FROM partita_carte pc
            JOIN carte c ON pc.carta_id = c.id
            WHERE pc.partita_id = ?
            ORDER BY c.indice ASC
        `;
        db.all(sql,[partita_id],(err,rows)=>{
            if(err){
                rej(err);
            }
            else{
                res(rows);
            }
        });
    });
}

// Funzione che ritorna le tre carte iniziali
export function getPrimeCarte(partita_id){
    return new Promise((res,rej)=>{
        const sql= `SELECT c.nome as nome_carta 
                    FROM carte c 
                    JOIN partita_carte pc 
                    ON c.id = pc.carta_id 
                    WHERE pc.partita_id = ? 
                    AND pc.vinta_in_round = ?`;
                    
        db.all(sql,[partita_id,0],(err,rows)=>{
            if(err){
                rej(err);
            }
            else{
                res(rows.map(row => row.nome_carta));
            }
        });
    });
}
