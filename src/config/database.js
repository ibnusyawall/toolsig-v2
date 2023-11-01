import Datastore from 'nedb'
import path from 'node:path'

const db = {}

db.account = new Datastore({
    filename: path.resolve('src/database/accounts.json')
})

export {
    db
}