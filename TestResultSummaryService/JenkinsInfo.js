const Promise = require( 'bluebird' );
const jenkinsapi = require( 'jenkins-api' );
const { logger } = require( './Utils' );

const options = { request: { timeout: 2000 } };

//Server connection may drop. If timeout, retry. 
const retry = fn => {
    const promise = Promise.promisify( fn );
    return async function() {
        for ( let i = 0; i < 5; i++ ) {
            try {
                return await promise.apply( null, arguments );
            } catch ( e ) {
                logger.warn( `Try #${i + 1}: connection issue`, arguments );
                logger.warn( e );
            }
        }
    }
}

class JenkinsInfo {
    async getAllBuilds( url, buildName ) {
        const jenkins = jenkinsapi.init( url, options );
        const all_builds = retry( jenkins.all_builds );
        const builds = await all_builds( buildName );
        return builds;
    }

    async getBuildOutput( url, buildName, buildNum ) {
        const jenkins = jenkinsapi.init( url, options );
        const console_output = retry( jenkins.console_output );
        const { body } = await console_output( buildName, buildNum );
        return body;
    }

    async getBuildInfo( url, buildName, buildNum ) {
        const jenkins = jenkinsapi.init( url, options );
        const build_info = retry( jenkins.build_info );
        const body = await build_info( buildName, buildNum );
        return body;
    }

    async getLastBuildInfo( url, buildName ) {
        const jenkins = jenkinsapi.init( url, options );
        const last_build_info = retry( jenkins.last_build_info );
        const body = await last_build_info( buildName );
        return body;
    }
}

module.exports = JenkinsInfo;