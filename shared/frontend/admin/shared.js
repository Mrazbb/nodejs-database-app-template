FUNC.savequery = function (key, value) {
    var url = new URL(location.href);

    if (value === undefined || value === null) {
        url.searchParams.delete(key);
    } else {
        url.searchParams.set(key, value);
    }

    history.pushState({}, '', url);
};

FUNC.clearquery = function () {
    var url = new URL(location.href);
    url.searchParams.clear();
    history.pushState({}, '', url);
};

FUNC.readquery = function (key) {
    var url = new URL(location.href);
    return url.searchParams.get(key);
};