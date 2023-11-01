import { db } from '../config/database.js'

class AccountModel {
    constructor() {
        db.account.loadDatabase()
        this.account = db.account
    }
    create(data) {
        return new Promise((resolve, reject) => {
            this.account.insert(data, (err, doc) => {
                if (err) reject(err)
                else resolve(doc)
            })
        })
    }
    findAll() {
        return new Promise((resolve, reject) => {
            this.account.find({}, (err, doc) => {
                if (err) reject(err)
                else resolve(doc)
            })
        })
    }
    findOne(_id) {
        return new Promise((resolve, reject) => {
            this.account.findOne({ _id }, (err, doc) => {
                if (err) reject(err)
                else resolve(doc)
            })
        })
    }
    update(_id, data) {
        return new Promise((resolve, reject) => {
            this.account.update({ _id }, {
                $set: { ...data },
            }, { multi: true }, (err, doc) => {
                if (err) reject(err)
                else resolve(doc)
            })
        })
    }
    destroy(_id) {
        return new Promise((resolve, reject) => {
            this.account.remove({ _id }, {}, (err, num) => {
                if (err) reject(err)
                else resolve(num)
            })
        })
    } 
}

export {
    AccountModel
}