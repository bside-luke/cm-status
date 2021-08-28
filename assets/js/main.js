function ping(ip, callback) {

    if (!this.inUse) {
        this.status = 'unchecked';
        this.inUse = true;
        this.callback = callback;
        this.ip = ip;
        var _that = this;
        this.img = new Image();
        this.img.onload = function () {
            _that.inUse = false;
            _that.callback('responded', _that.start);

        };
        this.img.onerror = function (e) {
            if (_that.inUse) {
                _that.inUse = false;
                _that.callback('responded', _that.start, e);
            }

        };
        this.start = new Date().getTime();
        this.img.src = ip;
        this.timer = setTimeout(function () {
            if (_that.inUse) {
                _that.inUse = false;
                _that.callback('timeout', this.start);
            }
        }, 1500);
    }
}
var PingModel = function (servers) {
    var self = this;
    self.completion = "Please wait for the below results to load";
    var myServers = [];
    ko.utils.arrayForEach(servers, (server) => {
        myServers.push({
            ep: server.ep,
            friendly: server.friendly,
            status: ko.observable('unchecked'),
            taken: ko.observable('unchecked')
        });
    });
    self.servers = ko.observableArray(myServers);
    ko.utils.arrayForEach(self.servers(), function (s) {
        s.status('checking');
        new ping(s.ep, function (status, started, _e) {
            const taken = new Date().getTime() - started + ' ms';
            s.status(status);
            s.taken = taken;
        });
    });
    self.completion = "Local status checks completed";
};

var komodel = new PingModel([
    { ep: 'https://62477.playfabapi.com', friendly: 'playfab' },
    { ep: 'https://content-api.cloud.unity3d.com/api/v1/', friendly: 'unity' },
    { ep: 'config.uca.cloud.unity3d.com', friendly: 'unity-uca' }

]);

window.onload = () => {
    ko.applyBindings(komodel);
};
