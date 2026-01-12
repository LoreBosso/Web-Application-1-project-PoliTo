import dayjs from 'dayjs';
import { db } from '../db/openDb.mjs';

// Funzione per elencare le partite di un utente
export function listPartite(utente_id){
    return new Promise((res,rej)=>{
        const sql = `SELECT id, stato AS esito, rounds_giocati AS numero_rounds , data
                     FROM partite
                     WHERE utente_id = ? AND (stato = "vinta" OR stato= "persa")
                     ORDER BY data DESC
                     `;

        db.all(sql,[utente_id],(err,rows)=>{
            if(err){
                rej(err);
            }
            else{
                res(rows)
            }
        });
    });
}

// Funzione per inserire una nuova partita nel database
export function addPartita(utente_id) {
    let data = dayjs().format('DD-MM-YYYY HH:mm:ss');
    return new Promise((res, rej) => {
        const sql =`INSERT INTO partite (utente_id, stato, rounds_giocati, data) 
                    VALUES (?, ?, ?,?)`;
                    
        db.run(sql, [utente_id, "non terminata", 0, data], function(err) {
            if (err) {
                console.error("Errore nell'inserimento della partita: " + err.message);
                rej(err);
            } else {
                
                res(this.lastID);
            }
        });
    });
}

// Funzione che ritorna i dettagli di una partita
export function getPartita(partita_id){
    return new Promise((res,rej)=>{
        const sql =`SELECT * 
                    FROM partite 
                    WHERE id = ?`;
        db.get(sql,[partita_id],(err,row)=>{
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

// Funzione che ritorna i round vinti e persi in una partita
export function partitaStat(partita_id){
    return new Promise((res,rej)=>{
        const sql= `SELECT SUM
                    (CASE WHEN stato = 'vinto' THEN 1 ELSE 0 END) as vittorie, 
                    SUM
                    (CASE WHEN stato = 'perso' THEN 1 ELSE 0 END) as sconfitte 
                    FROM partita_rounds 
                    WHERE partita_id = ?`;

        db.get(sql, [partita_id], (err,row)=>{
            if (err){
                rej(err);
            }
            else{
                res(row);
            }
        });
    });
}

//Funzione per aggiornare lo stato della partita
export async function updatePartita(partita_id,stato){
    try{
        const conteggio = await partitaStat(partita_id);
        await updateCountPartita(partita_id,(parseInt(conteggio.vittorie) + parseInt(conteggio.sconfitte)));
        return new Promise((res,rej)=>{
            const sql= `UPDATE partite 
                        SET stato = ? 
                        WHERE id = ?`;

            db.run(sql,[stato,partita_id],function(err) {
                if (err) {
                    console.error("Errore nella chiusura della partita: " + err.message);
                    rej(err);
                } else {
                    res(true);
                }
            });
        });
    }
    catch(err){
        console.error("Errore durante l'aggiornamento della partita: " + err.message);
        throw err;
    }
}

// Funzione per aggiornare il conteggio dei round di una partita
function updateCountPartita(partita_id,count){
    return new Promise((res,rej)=>{
        const sql= `UPDATE partite 
                    SET rounds_giocati = ? 
                    WHERE id = ?`;

        db.run(sql,[count,partita_id],function(err) {
            if (err) {
                console.error("Errore nella chiusura della partita: " + err.message);
                rej(err);
            } else {
                res(true);
            }
        });
    });
}
