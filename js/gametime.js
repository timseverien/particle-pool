(function() {
    var GameTime = function() {
        this.delta = 0;
        this.elapsed = 0;
        this.now = GameTime.getTime();
        this.start = GameTime.getTime();
    };

    GameTime.prototype.update = function() {
        var now = GameTime.getTime();

        this.elapsed = now - this.start;
        this.delta = now - this.now;

        this.now = now;
    };

    GameTime.getTime = function() {
        return (new Date().getTime() / 1000);
    };

    window.GameTime = GameTime;
})();
