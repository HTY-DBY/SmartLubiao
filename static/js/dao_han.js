// 构造地图类
map = new AMap.Map('container', {
    resizeEnable: true,
});

// 全局变量 隐性声明
marker_old = {};
R_qidian_weizhi = ''; //起点坐标
Q_qidian_weizhi = '';
R_now_weizhi = '';
Q_now_weizhi = '';
R_zhongdian_weizhi = ''; //终点坐标
Q_zhongdian_weizhi = '';
zhuobiao_zhuanhuan_R = ''; //gps转高德后的坐标，即路标坐标
zhuobiao_zhuanhuan_Q = '';
go_lujin_all = []; //存放所有的 路径坐标
go_lubiao_all = []; //存放所有的 路标坐标
qidian_zhixiang_is_yes = 0;
dian_xuan_qidian = 0;
go_is_yes_or_data_is_all = 0;
is_first_dingwei = 1;
kai_fa_zhe_is_yes_on = 0;
you_are_using_yes = 0

// 控件参数配置
AMap.plugin(['AMap.Icon',
    'AMap.Geolocation', // 定位
    'AMap.Autocomplete', //提示
    'AMap.Geocoder',
    'AMap.Riding',
],
    () => {
        // 创建 AMap.Icon
        // 起点
        icon_qidian = new AMap.Icon({
            // 图标尺寸
            size: new AMap.Size(25, 34),
            // 图标的取图地址
            // 这是我的个人服务器的图片
            image: '../static/image/dir-marker.png',
            // 图标所用图片大小
            imageSize: new AMap.Size(135, 40),
            // 图标取图偏移量
            imageOffset: new AMap.Pixel(-9, -3)
        });
        // 当前位置
        icon_my_here = '../static/image/loc.png';
        // 路标
        icon_lubiao = '../static/image/lubiao_here.png';
        // 终点
        icon_zhongdian = new AMap.Icon({
            size: new AMap.Size(25, 34),
            image: '../static/image/dir-marker.png',
            imageSize: new AMap.Size(135, 40),
            imageOffset: new AMap.Pixel(-95, -3)
        });

        // 定位
        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 5000,
            convert: true, //是否使用坐标偏移，取值true: 为高德地图坐标
            showButton: false, //是否显示定位按钮 默认值：true
            showMarker: false, //定位成功时是否在定位位置显示一个Marke
            showCircle: false, //定位成功并且有精度信息时，是否用一个圆圈circle表示精度范围
            panToLocation: false, //	定位成功后，
            //是否把定位得到的坐标设置为地图中心点坐标 默认值：true
            zoomToAccuracy: false, //定位成功且显示精度范围时，是否把地图视野调整到正好显示精度范围 默认值：false
            useNative: false, //	是否使用安卓定位sdk用来进行定位，默认：false
            extensions: 'base',
            GeoLocationFirst: true, //默认为false，设置为true的时候可以调整PC端为优先使用浏览器定位，失败后使用IP定位
        });

        // 提示框控件设置
        autoComplete = new AMap.Autocomplete({
            input: 'tishikuan',
            city: '全国', //city 限定城市，默认全国
        });

        // 反地理位置控件设置
        geocoder = new AMap.Geocoder({
            radius: 10, //逆地理编码时，以给定坐标为中心点，单位：米 取值范围：0-3000
        });

        //构造路线导航设置
        Riding = new AMap.Riding({
            map: map,
            panel: "panel",
            // 结果列表的HTML容器id或容器元素，
            // 提供此参数后，结果列表将在此容器中进行展示。可选参数
            hideMarkers: true, //设置隐藏路径规划的起始点图标，
            //设置为true：隐藏图标；设置false：显示图标 默认值为：false
            autoFitView: false, //用于控制在路径规划结束后，是否自动调整地图视野使绘制的路线处于视口的可见范围
        });
    });

// 控件加入
map.addControl(geolocation);

// 覆盖物合集方法
OverlayGroup_all = new AMap.OverlayGroup()
OverlayGroup_all.setMap(map)

// 为坐标增加当前位置图标
function zuobiao_to_my(R, Q) {
    tubiao_my_here = new AMap.Marker({
        position: new AMap.LngLat(R, Q),
        icon: icon_my_here,
        zIndex: 102,// 点标记的叠加顺序，默认zIndex：100
        offset: new AMap.Pixel(-10, -11)// 点标记显示位置偏移量，默认值为Pixel(-10,-34)
    });
    // console.log(tubiao_my_here.getOffset())
    map.add(tubiao_my_here)
}

// 为坐标增加起点图标
function zuobiao_to_qidian(R, Q) {
    marker_qidian = new AMap.Marker({
        position: new AMap.LngLat(R, Q),
        icon: icon_qidian,
        zIndex: 103,// 点标记的叠加顺序，默认zIndex：100
    });
    map.add(marker_qidian);
}

// 定位后的判断
dingwei_panduan = function () {
    if (kai_fa_zhe_is_yes_on == 0) {
        document.getElementById('status').innerHTML = '定位中';
        geolocation.getCurrentPosition(function (status, result) {
            if (status == 'complete') {
                // console.log(result)
                onComplete(result);
            } else {
                onError(result);
            }
        })
    }
};
dingwei_panduan();

// 每 x 秒 重复执行 实时定位
dingwei_shishi = 0;
function dingwei_shishi_function() {
    if (kai_fa_zhe_is_yes_on == 0) {
        dingwei_shishi = 1;
        console.log('实时定位');
        dingwei_panduan();
    }

}
setInterval(() => { this.dingwei_shishi_function() }, 25000);

//解析定位正确信息
dingwei_chongxin = 0;
is_first_dingwei_kaifazhe = 0
function onComplete(data) {
    // 如果是第一次定位
    if (is_first_dingwei == 1) {
        is_first_dingwei_kaifazhe = 1
        R_qidian_weizhi = data.position.R;
        Q_qidian_weizhi = data.position.Q;
        R_now_weizhi = data.position.R;
        Q_now_weizhi = data.position.Q;
        is_first_dingwei = 0;
        // 给定一个icon以标记
        zuobiao_to_my(R_now_weizhi, Q_now_weizhi);

        //同时设置地图层级与中心点
        map.setZoomAndCenter(17, data.position);

        zuobiao_to_qidian(R_now_weizhi, Q_now_weizhi);
        document.getElementById('qi_dian').innerHTML = '同&nbsp;我的位置'
        document.getElementById('my_wei_zhi_dian').innerHTML = data.formattedAddress;
    }
    // 如果触发重起点
    if (qidian_zhixiang_is_yes == 1) {
        R_qidian_weizhi = data.position.R;
        Q_qidian_weizhi = data.position.Q;
        qidian_zhixiang_is_yes = 0;
        // map.setZoomAndCenter(19, data.position);
        map.remove(marker_qidian);
        zuobiao_to_qidian(R_now_weizhi, Q_now_weizhi);
        document.getElementById('qi_dian').innerHTML = data.formattedAddress;
        document.getElementById('my_wei_zhi_dian').innerHTML = '同&nbsp;起点';
    }
    // 如果实时定位
    if (dingwei_shishi == 1) {
        dingwei_shishi = 0;
        R_now_weizhi = data.position.R;
        Q_now_weizhi = data.position.Q;
        geocoder.getAddress([R_qidian_weizhi, Q_qidian_weizhi], function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
                // console.log(result);
                document.getElementById('qi_dian').innerHTML = result.regeocode.formattedAddress;
            }
        })
        map.remove(tubiao_my_here)
        zuobiao_to_my(R_now_weizhi, Q_now_weizhi);
        document.getElementById('my_wei_zhi_dian').innerHTML = data.formattedAddress;
    }
    // 如果触发重定位
    if (dingwei_chongxin == 1) {
        dingwei_chongxin = 0;
        R_now_weizhi = data.position.R;
        Q_now_weizhi = data.position.Q;
        //同时设置地图层级与中心点
        map.setZoomAndCenter(17, data.position);
        map.setZoomAndCenter(17, data.position);
        geocoder.getAddress([R_qidian_weizhi, Q_qidian_weizhi], function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
                // console.log(result);
                document.getElementById('qi_dian').innerHTML = result.regeocode.formattedAddress;
            }
        })
        map.remove(tubiao_my_here);
        zuobiao_to_my(R_now_weizhi, Q_now_weizhi);
        document.getElementById('my_wei_zhi_dian').innerHTML = data.formattedAddress;
    };
    // 判断定位的方式
    if (data.accuracy) {
        document.getElementById('status').innerHTML = `定位成功&nbsp&nbsp&nbsp精度：${data.accuracy}米`;
    } else {
        //如为IP精确定位结果则没有精度信息
        document.getElementById('status').innerHTML = '定位成功&nbsp&nbsp&nbsp当前为 IP 定位方式';
        document.getElementById('qi_dian').innerHTML = data.position;
    }
}

// 解析定位错误信息
function onError(data) {
    document.getElementById('status').innerHTML =
        `定位失败<br>微信浏览器有时会出现问题,请移步浏览器打开<br>PC 端请不要用谷歌浏览器打开，被墙了暂时没想出解决方法`;
}

// 起点指向
qidian_zhixiang_the_num = 0;
qidian_zhixiang_clear_is_yes = -1;
jishi_qidian_zhixiang = 5;
qidian_kaifazhe_inyour = 0
function qidian_zhixiang_clear() {
    if (0 <= qidian_zhixiang_clear_is_yes &&
        qidian_zhixiang_clear_is_yes < jishi_qidian_zhixiang + 1) {
        qidian_zhixiang_clear_is_yes = qidian_zhixiang_clear_is_yes + 1;
        document.getElementById('tishi_qidian').innerHTML =
            '是否重设起点,再次点击确认,5s后自动取消&nbsp;' +
            qidian_zhixiang_clear_is_yes + 's';
    }
    if (qidian_zhixiang_clear_is_yes == jishi_qidian_zhixiang + 1) {
        document.getElementById('tishi_qidian').innerHTML = '已取消';
        qidian_zhixiang_clear_is_yes = -1;
        qidian_zhixiang_the_num = 0;

        function qidian_zhixiang_clear_all() {
            document.getElementById('tishi_qidian').innerHTML = '';
        }
        setTimeout(qidian_zhixiang_clear_all, 3000);
    }

}
setInterval(() => { this.qidian_zhixiang_clear() }, 1000);
$("#qi_zhixiang").click(function () {
    // 当处于正常模式
    if (kai_fa_zhe_is_yes_on == 0) {
        qidian_zhixiang_the_num = qidian_zhixiang_the_num + 1;
        if (qidian_zhixiang_the_num == 1) {
            qidian_zhixiang_clear_is_yes = 0;
        }

        if (qidian_zhixiang_the_num == 2) {
            qidian_zhixiang_clear_is_yes = -1;
            qidian_zhixiang_is_yes = 1;
            document.getElementById('tishi_qidian').innerHTML = '';
            dingwei_panduan();
            qidian_zhixiang_the_num = 0;
        }
    }
    if (qidian_kaifazhe_inyour == 1) {
        qidian_kaifazhe_begin = 1
        my_kaifazhe_begin = 0
        document.getElementById('qi_dian').innerHTML = '请点选起点';
    }

});


// 监听 提示框控件
AMap.event.addListener(autoComplete, "select", function (data) {
    // console.log(data);
    if (data.poi.location != undefined) {
        map.remove(marker_old);
        //同时设置地图层级与中心点
        map.setZoomAndCenter(19, data.poi.location);
        //地图显示的缩放级别范围
        // 在PC上，默认为[3,18]，取值范围[3-18]；
        // 在移动设备上，默认为[3,19],取值范围[3-19]
        R_zhongdian_weizhi = data.poi.location.R;
        Q_zhongdian_weizhi = data.poi.location.Q;
        marker_old = new AMap.Marker({
            position: new AMap.LngLat(R_zhongdian_weizhi, Q_zhongdian_weizhi),
            icon: icon_zhongdian,
        });
        marker_new = marker_old;
        map.add(marker_new);

        geocoder.getAddress(data.poi.location, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
                // console.log(result);
                document.getElementById('zhong_dian').innerHTML = result.regeocode.formattedAddress;
            }
        })
    }
})


// 左键点击事件
zuojian_is_yes_click = 0
qidian_kaifazhe_begin = 0
my_kaifazhe_begin = 0
map.on('click', (data) => {
    // console.log(data.lnglat);
    zuojian_is_yes_click = 1;
    var R = data.lnglat.R;
    var Q = data.lnglat.Q;
    // 自选起点
    if (qidian_kaifazhe_begin == 1) {
        qidian_kaifazhe_begin = 0
        my_kaifazhe_begin = 0
        geocoder.getAddress(data.lnglat, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
                // console.log(result);
                map.remove(marker_qidian);
                zuobiao_to_qidian(R, Q)
                document.getElementById('qi_dian').innerHTML = result.regeocode.formattedAddress;
                R_qidian_weizhi = R;
                Q_qidian_weizhi = Q;
            }
        });
    } else if (my_kaifazhe_begin == 1) {
        // 自选我的位置
        my_kaifazhe_begin = 0
        geocoder.getAddress(data.lnglat, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
                // console.log(result);
                map.remove(tubiao_my_here);
                zuobiao_to_my(R, Q)
                document.getElementById('my_wei_zhi_dian').innerHTML = result.regeocode.formattedAddress;
                R_now_weizhi = R;
                Q_now_weizhi = Q;
            }
        });
    } else {
        geocoder.getAddress(data.lnglat, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
                // console.log(result);
                map.remove(marker_old);
                marker_old = new AMap.Marker({
                    position: new AMap.LngLat(R, Q),
                    icon: icon_zhongdian,
                });
                marker_new = marker_old;
                document.getElementById('zhong_dian').innerHTML = result.regeocode.formattedAddress;
                map.add(marker_new);
                R_zhongdian_weizhi = R;
                Q_zhongdian_weizhi = Q;
            }
        });
    }


});

// 重定位 事件
my_kaifazhe_inyour = 0
document.getElementById('dingwei_zhixiang').onclick = function () {
    if (my_kaifazhe_inyour == 0) {
        dingwei_panduan();
        dingwei_chongxin = 1;
    } else {
        my_kaifazhe_begin = 1
        qidian_kaifazhe_begin = 0
        document.getElementById('my_wei_zhi_dian').innerHTML = '请点选位置';
    }

}

// 终点/起点切换
di_ji_qizhong = 1;
$('#zhongdian_qidian_zhixiang').click(function () {
    if (R_qidian_weizhi != '' && R_zhongdian_weizhi != '') {
        switch (di_ji_qizhong) {
            // 对 起点
            case (1):
                map.setZoomAndCenter(19, new AMap.LngLat(R_qidian_weizhi, Q_qidian_weizhi));
                di_ji_qizhong = 2;
                break;
            // 对 两点
            case (2):
                map.setFitView([marker_new, marker_qidian], true, [70, 210, 20, 20], 19);
                // 上下左右
                di_ji_qizhong = 3;
                break;
            // 对 终点
            case (3):
                map.setZoomAndCenter(19, new AMap.LngLat(R_zhongdian_weizhi, Q_zhongdian_weizhi));
                di_ji_qizhong = 4;
                break;
            // 对 两点
            case (4):
                map.setFitView([marker_new, marker_qidian], true, [70, 210, 20, 20], 19);
                di_ji_qizhong = 1;
                break;
        }
        // console.log(di_ji_qizhong)
    }
})


// 路线规划指向 go
document.getElementById('go_zhixiang').onclick = function () {
    if (R_qidian_weizhi != '' && R_zhongdian_weizhi != '') {
        document.getElementById('cha_xun').innerHTML = '查询中';
        Riding.search(new AMap.LngLat(R_qidian_weizhi, Q_qidian_weizhi),
            new AMap.LngLat(R_zhongdian_weizhi, Q_zhongdian_weizhi),
            (status, result) => {
                map.setFitView([marker_new, marker_qidian], true, [70, 210, 50, 50], 17);
                // result 即是对应的导航信息
                if (status == 'complete') {
                    console.log('绘制路线完成');
                    document.getElementById('cha_xun').innerHTML = '查询成功';

                    var go_lujin_all_jubu = [];
                    for (var i = 0; i < result.routes[0].rides.length; i++) {
                        go_lujin_all_jubu[i] = [result.routes[0].rides[i].start_location.R, result.routes[0].rides[i].start_location.Q];
                    }
                    go_lujin_all_jubu[result.routes[0].rides.length] = [result.routes[0].rides[result.routes[0].rides.length - 1].end_location.R,
                    result.routes[0].rides[result.routes[0].rides.length - 1].end_location.Q
                    ];
                    go_lujin_all = go_lujin_all_jubu;
                    // console.log(go_lujin_all);
                    // console.log(result.routes[0]);
                    function chaxun_xinxi_guihua() {
                        document.getElementById('cha_xun').innerHTML = '';
                    }
                    go_is_yes_or_data_is_all = 1;

                    you_are_using_yes = 0
                    setTimeout(chaxun_xinxi_guihua, 5000);

                    $("#lubiao_status")[0].innerHTML = '可查询路标状态'

                } else {
                    // console.log('获取数据失败');
                    document.getElementById('cha_xun').innerHTML = '调用的是自行车查询接口，距离太远，查询失败';
                }

            })
    }
};

// 坐标转换 并标注 先 N 后 E 先 R 后 Q
gaode_biaozhuni_is_yes = 0;
function weizhi_bianhua_gps_to_gaode(zuobiao, num, str) {
    var turnNum = function (nums) {
        return nums.map(Number);
    }
    // 将字符串数组 转为 数组
    zuobiao = turnNum(zuobiao);

    var zuobiao_then = [];

    // 如果数据为 GPS 原生 转化为 WGS84
    if (str == 'gps_biaozhun') {
        var zuobiao_gps_yuanshen_ge_shi = [];
        zuobiao_gps_yuanshen_ge_shi[0] = zuobiao[0] % 100;
        zuobiao_gps_yuanshen_ge_shi[1] = zuobiao[1] % 100;
        zuobiao_then[1] = ((parseInt(zuobiao[0] / 100)) + (zuobiao_gps_yuanshen_ge_shi[0] / 60));
        zuobiao_then[0] = ((parseInt(zuobiao[1] / 100)) + (zuobiao_gps_yuanshen_ge_shi[1] / 60));
    };

    // 如果数据为 高德坐标系
    if (str == 'gaode_biaozhun') {
        gaode_biaozhuni_is_yes = 1;
        zuobiao_then = zuobiao;
    }

    // 如果数据为 GPS 原生 进行标注并存储
    if (gaode_biaozhuni_is_yes == 0) {
        AMap.convertFrom(zuobiao_then, 'gps',
            (status, result) => {
                if (result.info === 'ok') {
                    zhuobiao_zhuanhuan_R = result.locations[0].R;
                    zhuobiao_zhuanhuan_Q = result.locations[0].Q;

                    go_lubiao_all[num] = [zhuobiao_zhuanhuan_R, zhuobiao_zhuanhuan_Q];

                    lubiao_biaozhu = new AMap.Marker({
                        position: new AMap.LngLat(zhuobiao_zhuanhuan_R, zhuobiao_zhuanhuan_Q),
                        icon: icon_lubiao,
                    });
                    OverlayGroup_all.addOverlay(lubiao_biaozhu)
                }

            }
        )
    }

    // 如果数据为 高德坐标系 进行标注并存储
    if (gaode_biaozhuni_is_yes == 1) {
        gaode_biaozhuni_is_yes = 0;
        go_lubiao_all[num] = zuobiao_then;
        lubiao_biaozhu = new AMap.Marker({
            position: new AMap.LngLat(zuobiao_then[0], zuobiao_then[1]),
            icon: icon_lubiao,
        });
        OverlayGroup_all.addOverlay(lubiao_biaozhu)
    }

    // 不让路标点外露
    OverlayGroup_all.hide()
};

// 路标标注
lubiao_ID = []
function lubiao_all_biaozhu() {
    $.ajax({
        url: "/API/on", // 数据提交 url
        type: "GET",
        data: {},
        /*提交的数据（json格式），从输入框中获取*/
        success: function (result) {
            // console.log(result);
            for (var i = 0; i < result.on_data.ID_len; i++) {
                weizhi_bianhua_gps_to_gaode(
                    [result.on_data.N[i], result.on_data.E[i]], i, result.on_data.str[i]);
                // console.log('路标已标注');
            }
            lubiao_ID = result.on_data.ID
        }
    });
};

// 显示路标位置，这里如果重复读取，会导致代码有bug，暂时没想好怎么改
lubiao_all_biaozhu();

