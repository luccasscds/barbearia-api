// ------------------------
//      SPEC FUNCTIONS
// ------------------------
const showMessage = showMessageFunc();

// ------------------------
//      MAIN
// ------------------------
(async () => {
    try {
        const currentBranch = await runScript("git branch --show-current");
        showMessage.success(`Branch: ${currentBranch}`);
        
        showMessage.info(`Versioning...`);
        await versioning();
        
        showMessage.info(`Start build...`);
        await runScript('npm run build');
        showMessage.success(`Build complete`);
        await runScript(`git push origin ${currentBranch} --tags --no-verify`);
        showMessage.success(`Git push`);
        
        // const current_url_origin = await runScript('git remote get-url origin');
        // const var_branch_production = 'production';
        // const version = getVersion();
        // await runScript(`cd dist/ && git init`);
        // showMessage.success(`cd dist/`);
        // await runScript(`cd dist/ && git checkout -B ${var_branch_production}`);
        // showMessage.success(`   > Created Branch ${var_branch_production}`);
        // await runScript(`cd dist/ && git add -A`);
        // await runScript(`cd dist/ && git commit -m "🚀 Deploy v${version}"`);
        // showMessage.success(`   > Commit `);
        // await runScript(`cd dist/ && git push -f ${current_url_origin} ${var_branch_production} --no-verify`);
        // showMessage.success(`   > Git Push to ${var_branch_production}`);

        showMessage.success('Done 🎉');
    } catch (error) {
        showMessage.error('Error: ', error);
    };
})()


// ------------------------
//      BODY FUNCTIONS
// ------------------------

async function runScript(command = '') {
    const util = require('node:util');
    const exec = util.promisify(require('node:child_process').exec);

    try {
        // showMessage.info(`command: ${command}`);

        if(!command) throw 'parâmetro vazio';

        const { stderr, stdout } = await exec(command);

        if( stderr && stderr.toLowerCase().includes('erro') ) {
            throw stderr;
        };
        return stdout.replace(/\n/g, '');
    } catch (error) {
        throw error;
    }
};

async function versioning(currentBranch = '') {
    try {
        const version = getVersion();
        const allAreNumberNineRegExp = /^9+$/;
        const [first, second, third] = version.split('.');
        currentBranch = currentBranch || await runScript("git branch --show-current");
        
        if(currentBranch === 'main') {
            if(allAreNumberNineRegExp.test(second)) {
                // v1.0.0
                const newVersion = await runScript("npm version major -m 'v%s'");
                showMessage.success(`v${version} >> ${newVersion}`);

            } else if(allAreNumberNineRegExp.test(third)) {
                // v0.1.0
                const newVersion = await runScript("npm version minor -m 'v%s'");
                showMessage.success(`v${version} >> ${newVersion}`);

            } else {
                // v0.0.1
                const newVersion = await runScript("npm version patch -m 'v%s'");
                showMessage.success(`v${version} >> ${newVersion}`);

            }
        } else if(currentBranch === 'dev') {
            // v1.0.0-1
            const newVersion = await runScript("npm version prerelease -m 'v%s'");
            showMessage.success(`v${version} >> ${newVersion}`);
            
            // $ npm version premajor
            // v1.0.0-0

            // npm version preminor
            // v0.1.0-0

            // npm version prepatch
            // v0.0.1-0
        };
    } catch (error) {
        throw error;
    }
};

function getVersion() {
    return require('./package.json').version;
};

function showMessageFunc() {
    return {
        success(text) {
            console.log('\x1b[32m%s\x1b[0m', text);
        },
        warning(text) {
            console.log('\x1b[33m%s\x1b[0m', text);
        },
        error(text) {
            console.log('\x1b[31m%s\x1b[0m', text);
        },
        info(text) {
            console.log('\x1b[34m%s\x1b[0m', text);
        },
    }

    // Colors reference

    // Reset = "\x1b[0m"
    // Bright = "\x1b[1m"
    // Dim = "\x1b[2m"
    // Underscore = "\x1b[4m"
    // Blink = "\x1b[5m"
    // Reverse = "\x1b[7m"
    // Hidden = "\x1b[8m"

    // # Text color
    // FgBlack = "\x1b[30m"
    // FgRed = "\x1b[31m"
    // FgGreen = "\x1b[32m"
    // FgYellow = "\x1b[33m"
    // FgBlue = "\x1b[34m"
    // FgMagenta = "\x1b[35m"
    // FgCyan = "\x1b[36m"
    // FgWhite = "\x1b[37m"
    // FgGray = "\x1b[90m"

    // # Background color
    // BgBlack = "\x1b[40m"
    // BgRed = "\x1b[41m"
    // BgGreen = "\x1b[42m"
    // BgYellow = "\x1b[43m"
    // BgBlue = "\x1b[44m"
    // BgMagenta = "\x1b[45m"
    // BgCyan = "\x1b[46m"
    // BgWhite = "\x1b[47m"
    // BgGray = "\x1b[100m"
};