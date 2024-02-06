const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

// ------------------------
//      MAIN
// ------------------------
(async () => {
    try {
        const current_url_origin = await runScript('git remote get-url origin');
        const currentBranch = (await runScript("git branch --show-current")).replace(/\n/g, '');
        await versioning();
        
        await runScript('npm run build');
        await runScript(`git push origin ${currentBranch} --tags --no-verify`);

        const var_branch_production = 'production';
        const version = getVersion();
        await runScript(`cd dist/ && git init`);
        await runScript(`cd dist/ && git checkout -B ${var_branch_production} > nul 2>&1`);
        await runScript(`cd dist/ && git add -A > nul 2>&1`);
        await runScript(`cd dist/ && git commit -m '🚀 Deploy v${version}'`);
        await runScript(`cd dist/ && git push -f ${current_url_origin} ${var_branch_production} --no-verify`);
        // await runScript(`cd ..`);

        console.log('Done 🎉');
    } catch (error) {
        console.error(error);
    };
})()


// ------------------------
//      FUNCTIONS
// ------------------------

async function runScript(command = '') {
    try {
        console.log('command: ', command);
        if(!command) throw 'parâmetro vazio';

        const { stderr, stdout } = await exec(command);
    
        if( stderr && 
            !stderr.includes('Compiled with warnings')) {
            throw stderr;
        };
        return stdout;
    } catch (error) {
        throw error;
    }
};

async function versioning() {
    try {
        const version = getVersion();
        const allAreNumberNineRegExp = /^9+$/;
        const [first, second, third] = version.split('.');
        const currentBranch = await runScript("git branch --show-current");
        
        if(currentBranch === 'main\n') {
            if(allAreNumberNineRegExp.test(second)) {
                // v1.0.0
                const newVersion = await runScript("npm version major -m 'v%s'");
                console.log(`v${version} >> ${newVersion}`);

            } else if(allAreNumberNineRegExp.test(third)) {
                // v0.1.0
                const newVersion = await runScript("npm version minor -m 'v%s'");
                console.log(`v${version} >> ${newVersion}`);

            } else {
                // v0.0.1
                const newVersion = await runScript("npm version patch -m 'v%s'");
                console.log(`v${version} >> ${newVersion}`);

            }
        } else {
            // v1.0.0-1
            const newVersion = await runScript("npm version prerelease -m 'v%s'");
            console.log(`v${version} >> ${newVersion}`);
            
            // $ npm version premajor
            // v1.0.0-0

            // npm version preminor
            // v1.1.0-0

            // npm version prepatch
            // v1.1.1-0
        };
    } catch (error) {
        throw error;
    }
};

function getVersion() {
    return require('./package.json').version;
};