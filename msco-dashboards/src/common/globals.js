var URL_PROCESS_TASKS = 'assets/json_data/processTasks.json';

var _LOCAL = true;

function getTargetPath(path) {
    if(_LOCAL) {
        return 'assets/json_data' + path + '.json';
    }

    return path;
}