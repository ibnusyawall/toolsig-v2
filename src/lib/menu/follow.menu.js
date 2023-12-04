import chalk from 'chalk'
import inquirer from 'inquirer'
import _ from 'lodash'
import { MainMenu } from './index.js'
import { instagram } from '../../config/Instagram.js'

const log = console.log
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function followMenu() {
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
    
            var filterisNotFollowing = []
            var filterisIsFollowing  = []
            var bulkFailedFollow = []
    
            Object.keys(checkingStatus).forEach(uid => {
                if (!checkingStatus[uid]['following']) {
                    filterisNotFollowing.push(uid)
                } else {
                    filterisIsFollowing.push(uid)
                }
            })
    
            log(chalk.bold.green(`${filterisNotFollowing.length} Ready to follow, ${filterisIsFollowing.length} Already following.`), '\n')
    
            var index = 1
            var _items = _.chunk(filterisNotFollowing, perExec);
            if (_items.length > 0) {
                for (var i = 0; i < _items.length; i++) {
                    for (var j = 0; j < _items[i].length; j++) {
                        var follow = await ig.follow(_items[i][j])
                        if (follow) {
                            log(chalk.bold.white(_items[i][j]), ':', chalk.bold.green('Follow'))
                        } else {
                            log(chalk.bold.white(_items[i][j]), ':', chalk.bold.red('Follow'), 'Added uid to bulk for retrying follow ...')
                            bulkFailedFollow.push(_items[i][j])
                        }
                    }
                    
                    var delayTimeRandomize = Math.round(Math.random() * delayTime) + 1000;
                    log(chalk.bold.yellow(`Using randomize delay ${delayTimeRandomize} second`))
                    await delay(delayTimeRandomize) // per second with random time
                }
            }
    
            if (bulkFailedFollow.length > 0) {
                await retryFollow(username, password, bulkFailedFollow, delayTime, perExec)
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
        // log(chalk.bold.red(`Your account is checkpoint!`))
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

async function retryFollow(username, password, bulkUids, delayTime, perExec) {
    var ig = new instagram(username, password);
    var login = await ig.login();
    var bulk = [...bulkUids]
    var _items = _.chunk(bulk, perExec);

    var bulkFailedFollow = []

    if (_items.length > 0) {
        for (var i = 0; i < _items.length; i++) {
            for (var j = 0; j < _items[i].length; j++) {
                var follow = await ig.follow(_items[i][j])
                if (follow) {
                    log(chalk.bold.white(_items[i][j]), ':', chalk.bold.green('Follow'))
                } else {
                    log(chalk.bold.white(_items[i][j]), ':', chalk.bold.red('Follow'), 'Added uid to bulk for retrying follow ...')
                    bulkFailedFollow.push(_items[i][j])
                }

            }
            var delayTimeRandomize = Math.round(Math.random() * delayTime) + 1000;
            log(chalk.bold.yellow(`Using randomize delay ${delayTimeRandomize} second`))
            await delay(delayTimeRandomize) // per second with random time
        }

        await retryFollow(username, password, bulkFailedFollow, delayTime, perExec)
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
    followMenu
}