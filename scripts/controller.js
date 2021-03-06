let random;
const UPDATE_DELAY = 500;
const KEY_DELAY = 100;
const WATCH_DOG_INTERVAL_TIME= 1000;
const MIN_SENSOR_VALUE = 0;
const MAX_SENSOR_VALUE = 255;
let isConnected = false;
let isSilentRadio = false;
let net = require('net');
let client = new net.Socket();
let interval_value=null;

let silentNextRequest = false;

let canvas = null;
let map = []; // Or you could call it "key"

let counter = 0;
let last_sensor_value = 0;


const electron  = require('electron');
const BrowserWindow = electron.BrowserWindow;


onkeydown = onkeyup = function(e) {
    //e.keyCode;
    e = e || event; // to deal with IE
    map[e.keyCode] = e.type == 'keydown';

    //map[(e.keyCode >= 97 ? e.keyCode-32 : e.keyCode)] = e.type == 'keydown';
    /*insert conditional here*/
};


function play_beep() {
    new Beep(22050).play(1000, 0.05, [Beep.utils.amplify(8000)]);
}

function do_beep_sound(sensor_value){
    // sensor_value = MAX_SENSOR_VALUE - sensor_value;
    // console.log(sensor_value);
    var duration = (1-(sensor_value/MAX_SENSOR_VALUE))*1000;
    if(duration < 100)
        duration = 100;
    clearInterval(interval_value);
    play_beep();
    interval_value = setInterval(function () {
        play_beep();
    },duration);
}

message = null;
ZeroMessage();


//40 = Down
//37 = Left
//39 = Right
//38 = Up
arrows = [38,39,40,37];
//Check other keys
keys = [
    {
        id:5,
        keys:['q','a']
    },
    {
        id:6,
        keys:['w','s']
    },
    {
        id:7,
        keys:['e','d']
    },
    {
        id:8,
        keys:['r','f']
    },
    {
        id:9,
        keys:['t','g']
    },
    {
        id:10,
        keys:['y','h']
    },
    {
        id:11,
        keys:['u']
    },
    {
        id:12,
        keys:['i','k']
    },
    {
        id:13,
        keys:['z','x','c','m']
    }
];




readKeys = function () {

    counter++;
    if( 10 == counter){
        do_beep_sound(last_sensor_value);
        counter=0;
    }



    /*
     for(var i=1;i<=arrows.length;i++){
     if(map[arrows[i-1]]){
     InitMessage(i-1,i,1);
     $("#btn_"+i).css('background-color','#2f2');
     }
     else{
     InitMessage(i-1,i,0);
     $("#btn_"+i).css('background-color','');
     }

     }*/



    /*
     * New change:
     * 8,5  => A_1
     * 7,4  => A_2
     *
     *
     * */
    if(map[104]){
        InitMessage('8',1,1);
        $("#btn_8").css('background-color','#2f2');
        $("#btn_5").css('background-color','');
    } else if(map[101]){
        InitMessage('5',1,2);
        $("#btn_8").css('background-color','');
        $("#btn_5").css('background-color','#2f2');
    }
    else{
        $("#btn_8").css('background-color','');
        $("#btn_5").css('background-color','');
    }



    if(map[103]){
        InitMessage('7',2,1);
        $("#btn_7").css('background-color','#2f2');
        $("#btn_4").css('background-color','');
    } else if(map[100]){
        $("#btn_7").css('background-color','');
        $("#btn_4").css('background-color','#2f2');
        InitMessage('4',2,2);
    }
    else{
        $("#btn_7").css('background-color','');
        $("#btn_4").css('background-color','');
    }

    for(var j=0;j<keys.length;++j){
        var lkeys = keys[j].keys;
        //var nothingPressed = true;

        for(var i=1;i<=lkeys.length;++i){
            //console.log(map,lkeys[i-1],lkeys[i-1].charCodeAt(0),lkeys[i-1].charCodeAt(0)+ 32,map[lkeys[i-1].charCodeAt(0)+ 32])
            if(map[lkeys[i-1].charCodeAt(0)-32]){
                //console.log(lkeys[i-1],gate[j].id,i);
                InitMessage(lkeys[i-1],keys[j].id,i);
                //nothingPressed = false;
                //break;
                $("#btn_"+lkeys[i-1]).css('background-color','#2f2');

            }else
                $("#btn_"+lkeys[i-1]).css('background-color', '');
        }

    }


    if(!isConnected)
        return;


    if(!isSilentRadio) //Dont do anything we are in silent state
    {
        SendToRobot();
        //console.log("RadioSilented:" + isSilentRadio)
    }


};




InitMessage = function (btn_id,gate_id,value_state) {

    if (gate_id==13)
        silentNextRequest=true;
    message[gate_id-1] = value_state;
};

function ZeroMessage() {
    message = [
        '0',
        '0',
        '0',

        '0',
        '0',
        '0',

        '0',
        '0',
        '0',

        '0',
        '0',
        '0',

        /*

         z -> Scan mineZ
         x -> Go Through Water pool
         c -> Do L Turn

         m -> Cancel other operations

        */
        '0'
    ];
}
SendToRobot = function () {

    //Disconnect robot
    if(!isConnected){
        console.log('No connection :|');
        return;
    }

    if (silentNextRequest){
        isSilentRadio=true;
        silentNextRequest=false;
    }

    let final_msg = message.join('') + '!'  ;

    // console.log(final_msg);

    try{
        client.write(final_msg);
    }catch (err){
        console.log("Connection refused :(");
    }

    ZeroMessage();//Reset message value


};

function ConnectToRobot() {


    try{
        client.connect($("#port_inp").val(), $('#ip_inp').val(), function() {
            console.log('Connected');
            isConnected = true;
        });
    }catch (err){
        console.log("Socket connection failed ! :(");
    }


}

function initUI() {
    //Read keys in an interval
    setInterval(readKeys,KEY_DELAY);

    initChart();
}


function ConnectionWatchDog() {
    if(!isConnected){
        $("#submit_btn").html("Reconnect").css('color','#ff4444');
        ConnectToRobot();
    }else
        $("#submit_btn").html("Connected").css('color','#88ff88');
}

function initChart(){
    random = new TimeSeries({resetBounds: false});
    canvas = document.getElementById("chart");
    canvas.width = window.innerWidth;
    var chart = new SmoothieChart();
    chart.addTimeSeries(random, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 2 });

    // Randomly add a data point every 50ms
    chart.streamTo(canvas, UPDATE_DELAY);
    random.append(new Date(),MAX_SENSOR_VALUE);
    random.append(new Date(),MIN_SENSOR_VALUE);
}

function setProgressBar(sensor) {
    // BrowserWindow.setProgressBar(sensor/MAX_SENSOR_VALUE);
}

$(document).ready(function () {

    $("#submit_btn").on("click",function () {
        ConnectToRobot();
    });

    setTimeout(function () {

        initUI();
        $(window).on('resize',function () {
            canvas.width = window.innerWidth;
        });
        ConnectToRobot();
        setInterval(ConnectionWatchDog,WATCH_DOG_INTERVAL_TIME);

        client.on('data', function(data) {
            //debugger;
            //console.log(data);
            isSilentRadio = false;

            var sensor = data[0];

            console.log(sensor);
            sensor = MAX_SENSOR_VALUE - sensor;
            random.append(new Date().getTime(),sensor );

            $("#sensor_out").val(sensor);
            last_sensor_value = sensor;
            setProgressBar(sensor);
            // console.log("Recieved: "+sensor+ "\r\n");
            isConnected = true;



        });

        client.on('close', function() {
            console.log('Connection closed');
            $("#submit_btn").html("Reconnect").css('color','#ff4444');
            ConnectToRobot();
            isConnected = false;
        });

        client.on('uncaughtException', function (err) {
            console.log("Something went wrong :| "+err);
        });


        //Only for demo - it's for reading data from input
        // setInterval(function() {
        //     var value = Math.random() * 10000;
        //     random.append(new Date().getTime(),value);
        // }, UPDATE_DELAY);

    },500);




    $( ".circle" ).draggable();
});



