import chalk from 'chalk'
import inquirer from 'inquirer'
import { AccountModel } from '../../model/account.model.js'
import { FollowMenu, MainMenu } from './index.js'
import { instagram } from '../../config/Instagram.js'

const Account = new AccountModel()

const log = console.log

async function loginMenu() {
    var result = '\nLIST ACCOUNT:'

    var accounts = await Account.findAll()

    if (accounts.length > 0) {
        accounts.map(({
            username,
        }, index) => {
            result += `\n${index+1}. ${username}`
        })
    
        log(chalk.bold.white(result), '\n')
    
        var regExp = new RegExp(`[1-${accounts.length}]`)
        
        var { number } = await inquirer.prompt({
            type: 'input',
            name: 'number',
            message: `Select account [1-${accounts.length}]:`,
            validate: (val) => regExp.test(val) || 'Only input valid a account number',
        })
    
        var { username, password } = accounts[number-1]
        
        // actions
        const ig = new instagram(username, password);
        log("\nTry to Login . . .");
        const login = await ig.login();

        await FollowMenu(ig, login, username, password)
    } else {
        log(chalk.bold.red('You not have an account'))

        var { confirm } = await inquirer.prompt({
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
}

export {
    loginMenu
}