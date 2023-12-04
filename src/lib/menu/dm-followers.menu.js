import chalk from 'chalk'
import inquirer from 'inquirer'
import _ from 'lodash'
import path from 'node:path'
import fs from 'fs'

import { MainMenu } from './index.js'
import { instagram } from '../../config/Instagram.js'

const log = console.log
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function dmFollowers() {
    var questions = [
        {
            type: "input",
            name: "username",
            message: "Input Username:",
            validate: (val) => val.length != 0 || "Please input username!",
        },
        {
            type: "password",
            name: "password",
            mask: "*",
            message: "Input password:",
            validate: (val) => val.length != 0 || "Please input password!",
        },
        {
            type: "input",
            name: "target",
            message: "Input target's username (without '@'):",
            validate: (val) => val.length != 0 || "Please input target's username!",
        },
        {
            type: "input",
            name: "perExec",
            message: "Input limit per-execution:",
            validate: (val) => /[0-9]/.test(val) || "Only input numbers",
        },
        {
            type: "input",
            name: "delayTime",
            message: "Input sleep time (in milliseconds):",
            validate: (val) => /[0-9]/.test(val) || "Only input numbers",
        },
    ]

    var { username, password, target, perExec, delayTime } = await inquirer.prompt(questions)

    try {
        var inputMessage = fs.readFileSync(path.resolve('dm-text.txt'), { encoding: 'utf-8' })

        var ig = new instagram(username, password);
        log(chalk.bold.yellow("Try to Login . . ."));
        var login = await ig.login();
        log(chalk.bold.green(`Logged in as @${login.username} (User ID: ${login.pk})`));
        log(chalk.bold.yellow(`Collecting information of @${target} . . .`));

        var id   = await ig.getIdByUsername(target)
        var info = await ig.userInfo(id)
    
        if (!info.is_private) {
            log('\n', chalk.bold.yellow(`@${target} (User ID: ${id}) => Followers: ${info.follower_count}, Following: ${info.following_count}`), '\n')
    
            var targetFollowers = await ig.followersFeed(id);
            var items = await targetFollowers.items();
            var itemsPk = items.map(({ pk }) => pk)
            var checkingStatus = await ig.friendshipStatusMany([...itemsPk])
    
            var filterisNotPrivate = []
            var filterisIsPrivate  = []
            var bulkFailedDm = []
    
            Object.keys(checkingStatus).forEach(uid => {
                if (!checkingStatus[uid]['is_private']) {
                    filterisNotPrivate.push(uid)
                } else {
                    filterisIsPrivate.push(uid)
                }
            })
    
            log(chalk.bold.green(`${filterisNotPrivate.length} Ready to dm, ${filterisIsPrivate.length} is Private account (skipping).`), '\n')
    
            var index = 1
            var _items = _.chunk(filterisNotPrivate, perExec);
            if (_items.length > 0) {
                log(chalk.bold.yellow('Reading dm text from dm-text.txt ...'))
                var text = inputMessage.split("|");
                var msg = text[Math.floor(Math.random() * text.length)];

                for (var i = 0; i < _items.length; i++) {
                    for (var j = 0; j < _items[i].length; j++) {
                        var dm = await ig.sendDirectMessage(_items[i][j], msg)
                        if (dm) {
                            log(chalk.bold.white(_items[i][j]), ':', chalk.bold.green('DM SEND'))
                        } else {
                            log(chalk.bold.white(_items[i][j]), ':', chalk.bold.red('DM SEND'), 'Added uid to bulk for retrying SEND DM ...')
                            bulkFailedDm.push(_items[i][j])
                        }
                    }
                    
                    var delayTimeRandomize = Math.round(Math.random() * delayTime) + 1000;
                    log(chalk.bold.yellow(`Using randomize delay ${delayTimeRandomize} second`))
                    await delay(delayTimeRandomize) // per second with random time
                }
            }
    
            if (bulkFailedDm.length > 0) {
                await retryDm(username, password, bulkFailedDm, delayTime, perExec, inputMessage)
            } else {
                log('\n', chalk.bold.white('Status: All Task done!'), '\n')
    
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
        } else {
            log(chalk.bold.red(`@${target} is private account`))
    
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
    } catch (err) {
        log(chalk.bold.red(`Your account is checkpoint!`), String(err))

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

async function retryDm(username, password, bulkUids, delayTime, perExec, inputMessage) {
    var ig = new instagram(username, password);
    var login = await ig.login();
    var bulk = [...bulkUids]
    var _items = _.chunk(bulk, perExec);

    var bulkFailedDm = []

    if (_items.length > 0) {
        var text = inputMessage.split("|");
        var msg = text[Math.floor(Math.random() * text.length)];

        for (var i = 0; i < _items.length; i++) {
            for (var j = 0; j < _items[i].length; j++) {
                var dm = await ig.sendDirectMessage(_items[i][j], msg)
                if (dm) {
                    log(chalk.bold.white(_items[i][j]), ':', chalk.bold.green('DM SEND'))
                } else {
                    log(chalk.bold.white(_items[i][j]), ':', chalk.bold.red('DM SEND'), 'Added uid to bulk for retrying DM SEND ...')
                    bulkFailedDm.push(_items[i][j])
                }

            }
            var delayTimeRandomize = Math.round(Math.random() * delayTime) + 1000;
            log(chalk.bold.yellow(`Using randomize delay ${delayTimeRandomize} second`))
            await delay(delayTimeRandomize) // per second with random time
        }

        await retryDm(username, password, bulkFailedDm, delayTime, perExec, inputMessage)
    } else {
        log('\n', chalk.bold.white('Status: All Task done!'), '\n')

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
    dmFollowers
}