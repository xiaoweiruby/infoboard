var HttpRequest = require("nebulas").HttpRequest;
var Neb = require("nebulas").Neb;
var Account = require("nebulas").Account;
var Transaction = require("nebulas").Transaction;
var Unit = require("nebulas").Unit;
var myneb = new Neb();
myneb.setRequest(new HttpRequest("https://mainnet.nebulas.io"));
var account, tx, txhash;
// var dapp_address = "n1u1mn29qxUV2BV8TXyZfTi12qgKwkGAjYk";

//to check if the extension is installed
//if the extension is installed, var "webExtensionWallet" will be injected in to web page
if (typeof (webExtensionWallet) === "undefined") {

} else {
    $("#wallet_alert").hide();
}

var dappAddress = "n1u1mn29qxUV2BV8TXyZfTi12qgKwkGAjYk";
// dappAddress = "n1sgsPCNuR9sw2Nekr8qFNRtQG2ySj5fLfD";

var value = "0";
var allCount = 0;

initPageData();

$("#btn_refresh").click(function () {
    initPageData();
});

function refreshData() {
    myneb.api.call({
        from: dappAddress,
        to: dappAddress,
        value: 0,
        contract: {
            function: "forEach",
            args: JSON.stringify([0, allCount])
        },
        gasPrice: 1000000,
        gasLimit: 2000000,
    }).then(function(tx) {
        arrs = JSON.parse(tx.result);
        console.log(arrs);
        refreshPage(tx);
    });
}

function initPageData() {
    myneb.api.call({
        from: dappAddress,
        to: dappAddress,
        value: 0,
        contract: {
            function: "len",
        },
        gasPrice: 1000000,
        gasLimit: 2000000,
    }).then(function(resp) {
            var result = resp.result;
            allCount = parseInt(result);
            console.log("allcount=" + allCount);
            // alert(allCount);
            refreshData();
    });
}

var mapMarkers = [];

function refreshPage(resp) {
    var result = resp.result;
    console.log("return of rpc call: " + JSON.stringify(result))

    if (result === 'null') {
        $("#noinfo_alert").show();
    } else {
        //if result is not null, then it should be "return value" or "error message"
        try {
            result = JSON.parse(result)
        } catch (err) {
            //result is the error message
        }
        console.log("result " + result);

        $("#info_table").html("");

        var arrar = result.split("|");
        var len = arrar.length;

        for (var i = 0; i < arrar.length - 1; i++) {

            var result1 = arrar[i];
            var obj = JSON.parse(result1);


            var author = obj.author;
            var nickname = obj.nickname;
            var timestamp = obj.timestamp;
            var longitude = obj.longitude;
            var latitude = obj.latitude;
            var message = obj.message;
            var contact = obj.contact;

            if (obj.nickname === "") {
                nickname = author;
            };

            if (obj.contact === "") {
                contact = "无";
            };

            var html = "<tr><td>" + message + "</td><td>" + nickname + "</td><td>" + contact + "</td></tr>";

            $("#info_table").append(html);
            mapMarkers.push({ name: nickname, latLng: [latitude, longitude] });
        };

        mapObj.addMarkers(mapMarkers, []);

    }

}


$("#btn_submit").click(function () {
    var message = $("#exampleInputContent").val();
    if (message === "") {
        alert("请填写发布内容");
    } else
        getLocation();
});

function cbPush(resp) {
    var result = resp.result;
    console.log("response of push: " + result);
    // if (result!='null') {

    // };
}

function getLocation() {
    console.log("getLocation");
    $("#load_alert").show();

    var geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function (r) {
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
            onSuccess(r.point.lat, r.point.lng);
            $("#load_alert").hide();
        }
        else {
            alert('failed' + this.getStatus());
        }
    });
    //浏览器定位，但是在Chrome里面需要用到Google定位，国内没法用
    // var options = {
    //     enableHighAccuracy: true,
    //     timeout:5000,
    //     maximumAge: 1000
    // };
    // if (navigator.geolocation) {
    //     //浏览器支持geolocation
    //     navigator.geolocation.getCurrentPosition(onSuccess);//
    //     // navigator.geolocation.getCurrentPosition(showPosition);调用成功则调用onSuccess函数，失败则调用onError函数
    // } else {
    //     //浏览器不支持geolocation
    //     error();//调用error函数提示用户
    // }
}
function error() {
    alert("sorry , your brower is not  used   for this position!  ");
}
function onError(position) {
    console.log(position);//打印错误信息
    var innerHTML = "获取位置错误";
    switch (error.code) {
        case error.PERMISSION_DENIED:
            innerHTML = "用户拒绝对获取地理位置的请求。需要科学上网获取位置"
            break;
        case error.POSITION_UNAVAILABLE:
            innerHTML = "位置信息是不可用的。需要科学上网获取位置"
            break;
        case error.TIMEOUT:
            innerHTML = "请求用户地理位置超时。需要科学上网获取位置"
            break;
        case error.UNKNOWN_ERROR:
            innerHTML = "未知错误。需要科学上网获取位置"
            break;
    }
    alert(innerHTML);
}
function onSuccess(lat, lag) {
    //116.349652,39.894567
    // lat = 39.894567;
    // lag = 116.349652;
    var message = $("#exampleInputContent").val();
    console.log("message " + message);
    var contact = $("#exampleInputContact").val();
    var nickname = $("#exampleInputNickname").val();
    var timestamp = new Date().getTime();

    var to = dappAddress;
    var value = "0";
    var callFunction = "save";
    var callArgs = "[\"" + nickname + "\",\"" + lag + "\",\"" + lat + "\",\"" + message + "\",\"" + contact + "\"]";

    window.postMessage({
            "target": "contentscript",
            "data": {
                "to": to,
                "value": "0",
                "contract": {
                    "function": "save",
                    "args": JSON.stringify([nickname,lag,lat,message,contact])
                }
            },
            "method": "neb_sendTransaction"
        }, "*");
}

//地图插件
var mapObj = new jvm.Map({
    container: $('#world-map'),
    map: 'world_mill',
    normalizeFunction: 'polynomial',
    scaleColors: ['#C8EEFF', '#0071A4'],
    hoverOpacity: 0.7,
    hoverColor: false,
    markerStyle: {
        initial: {
            fill: '#F8E23B',
            stroke: '#383f47'
        }
    },
    backgroundColor: '#383f47',
    markers: []
});

