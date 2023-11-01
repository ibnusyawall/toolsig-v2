import chalk from 'chalk'
import inquirer from 'inquirer'
import { AddAccountMenu, DeleteAccountMenu, DmFollowers, DmToFollowers, FollowDm, FollowMenu } from './index.js'

const log = console.log
const clear = console.clear

async function mainMenu() {
    clear()
    log(`${chalk.bold.white('- IGTools v2 -')}\n
${chalk.bold.bgCyan('MENU')}
${chalk.bold.white('1. Follow')}
${chalk.bold.white('2. DM Follower')}
${chalk.bold.white('3. Follow and DM')}
${chalk.bold.white('4. DM without Follow')}
    `)

    var { number } = await inquirer.prompt({
        type: 'input',
        name: 'number',
        message: 'Enter menu:',
        validate: (val) => /[1-4]/.test(val) || 'Only input valid a number of menu',
    })

    switch (Number(number)) {
        case 1:
            await FollowMenu()
            break;
        case 2:
            await DmToFollowers()
            break;
        case 3:
            await FollowDm()
            break;
        case 4:
            await DmFollowers()
            break;
        default:
            log(chalk.bold.white('Have a nice day!'))
            break;
    }
}

await mainMenu()

export {
    mainMenu
}