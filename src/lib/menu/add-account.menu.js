import chalk from 'chalk'
import inquirer from 'inquirer'
import { AccountModel } from '../../model/account.model.js'
import { MainMenu } from './index.js'

const Account = new AccountModel()

const log = console.log

async function addAccountMenu() {
    log()
    var { username, password } = await inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: 'Enter username:',
            validate: (val) => val.length != 0 || 'username is required',
        },
        {
            type: 'input',
            name: 'password',
            message: 'Enter password:',
            validate: (val) => val.length != 0 || 'username is required',
        },
    ])

    await Account.create({
        username,
        password
    })

    log('\n', chalk.bold.bgGreen('Account added successfully'), '\n')

    const { confirm } = await inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: 'Back to menu?',
        validate: (val) => val.length != 0 || 'Don\'t leave blank choices!',
    })

    if (confirm) {
        await MainMenu()
    } else {
        log(chalk.bold.white('Have a nice day!'))
    }
}

export {
    addAccountMenu
}