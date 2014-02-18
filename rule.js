var board;

canvas = document.getElementById("myCanvas");
function move_chess(e) {
    var real_x = e.pageX - canvas.offsetLeft;
    var real_y = e.pageY - canvas.offsetTop;
    var cell_x = Math.floor((real_x - board.st_x) / board.width);
    var cell_y = Math.floor((real_y - board.st_y) / board.width);
    board.press(cell_x, cell_y);
    console.log("press");
}

board = {
    canvas: document.getElementById("myCanvas"),
    ctx: document.getElementById("myCanvas").getContext("2d"),

    black_point: 2,
    white_point: 2,
    occupy: new Array(8),
    player_now: "black",

    width: 50,
    st_x: 50.5,
    st_y: 50.5,

    opposite: function(color){
        if(color == "black"){
            return "white";
        }
        return "black";
    },

    flip_player: function() {
        this.player_now = this.opposite(this.player_now);
    },

    bound: function(x, y) {
        return (x <= 7 && x >= 0 && y <= 7 && y >= 0);
    },

    kill_chess: function(color, x, y) {
        var coll = [];
        var direction = [ [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1] ];
        for(var i = 0; i < direction.length; i++){
            var dire = direction[i];
            var local_coll = [];
            for(var step = 1; this.bound(x + step * dire[0], y + step * dire[1]); step++){
                var th_x = x + (step * dire[0]);
                var th_y = y + (step * dire[1]);
                var ch = this.occupy[th_x][th_y];
                if(step == 1 && ch == this.opposite(color)){
                    local_coll.push([th_x, th_y]);
                }
                else if(step == 1){
                    break;
                }
                if(step > 1 && ch == color){
                    coll = coll.concat(local_coll);
                    break;
                }
                else if(step > 1 && ch == this.opposite(color)){
                    local_coll.push([th_x, th_y]);
                }
                else if(step > 1){
                    break;
                }
            }
        }
        return coll;
    },
    draw_cell: function(color, x, y){
        var center_x = this.st_x + this.width * (x + 0.5);
        var center_y = this.st_y + this.width * (y + 0.5);
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(center_x, center_y, 20, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    },
    check_rule: function (color, x, y) {
        return (this.bound(x, y) &&  this.occupy[x][y] == "none" &&  this.kill_chess(color, x, y).length > 0);
    },
    any_position: function(color) {
        var ok = false;
        for(var i = 0; i < 8 && !ok; i++){
            for(var j = 0; j < 8; j++){
                if(this.check_rule(color, i, j)){
                    ok = true;
                    break;
                }
            }
        }
        return ok;
    },
    change_score: function(killed, player){
        if(player == "black"){
            this.white_point -= killed;
            this.black_point += (killed + 1);
        }
        else{
            this.black_point -= killed;
            this.white_point += (killed + 1);
        }
        document.getElementById("score").innerHTML = "黑：" + this.black_point.toString() + "<br />白：" + this.white_point.toString();
    },
    press: function (x, y) {
        console.log("got pressed");
        if (this.check_rule(this.player_now, x, y)) {
            this.draw_cell(this.player_now, x, y);
            this.occupy[x][y] = this.player_now;
            console.log("kill!!");

//            將被殺的棋子翻面
            var killed = this.kill_chess(this.player_now, x, y);
            for(var i = 0; i < killed.length; i++){
                var pos_x = killed[i][0];
                var pos_y = killed[i][1];
                this.draw_cell(this.player_now, pos_x, pos_y);
                this.occupy[pos_x][pos_y] = this.player_now;
            }
//            改變分數
            this.change_score(killed.length, this.player_now);
//            檢測下一子是否有地方可下
            var oppo = this.opposite(this.player_now);
            if(this.any_position(oppo)){
                this.flip_player();
                return "success";
            }
            else if(!this.any_position(oppo)){
                return "again";
            }
            else if(!this.any_position(oppo) && !this.any_position(this.player_now)){
//                雙方都不能動了
//                end_game();
                return "end";
            }
        }
        else {
            return "fail";
        }
    },
    draw_board: function(){
        var st_x = this.st_x, st_y = this.st_y;
        var wid = this.width;
        for (var i = 0; i < 9; i ++) {
            this.ctx.moveTo(st_x, st_y + i * wid);
            this.ctx.lineTo(st_x + 8 * wid, st_y + i * wid);
        }
        for (var i = 0; i < 9; i ++) {
            this.ctx.moveTo(st_x + i * wid, st_y);
            this.ctx.lineTo(st_x + i * wid, st_y + 8 * wid);
        }
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "black";
        this.ctx.stroke();
    },
    draw_image: function(){
        var img = document.getElementById("background");
        this.ctx.drawImage(img, 0, 0, 1030, 580);
    },
    init: function(){
        this.draw_image();
        this.draw_board();
        this.canvas.addEventListener("click", move_chess, false);
        for(var i = 0; i < 8; i++){
            this.occupy[i] = new Array(8);
            for(var j = 0; j < 8; j++){
                this.occupy[i][j] = "none";
            }
        }
        this.occupy[3][3] = "black";
        this.occupy[4][4] = "black";
        this.occupy[3][4] = "white";
        this.occupy[4][3] = "white";
        this.draw_cell("black", 3, 3);
        this.draw_cell("white", 3, 4);
        this.draw_cell("black", 4, 4);
        this.draw_cell("white", 4, 3);
    }
};
